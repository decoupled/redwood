import { dirname, join } from 'path'

import { existsSync } from 'fs-extra'
import { LazyGetter as lazy } from 'lazy-get-decorator'
import { groupBy } from 'lodash'
import { computed, observable, reaction } from 'mobx'
import { now } from 'mobx-utils'
import * as vscode from 'vscode'
import { Location as LSPLocation } from 'vscode-languageserver-types'

import { vscode_mobx } from '../vscode/vscode_mobx'

import { redwoodjs_vsc_decoration_types } from './redwoodjs_vsc_decoration_types'
import { redwoodjs_vsc_log } from './redwoodjs_vsc_log'
import { redwoodjs_vsc_telemetry_reporter2 } from './telemetry/telemetry2'
import { redwoodjs_get_installed_framework_version_for_project } from './util/redwoodjs_get_installed_framework_version_for_project'
import { redwoodjs_vsc_commands_activate } from './vsc/commands/redwoodjs_vsc_commands_activate'
import { RedwoodLSPClientManager } from './vsc/lsp/redwoodjs_vsc_lsp_client'
import { redwoodjs_vsc_lsp_path_for_project } from './vsc/lsp/redwoodjs_vsc_lsp_path_for_project'
import { redwoodjs_vsc_enabled } from './vsc/redwoodjs_vsc_enabled'
import { redwoodjs_vsc_newVersionMessage } from './vsc/redwoodjs_vsc_newVersionMessage'
import { RedwoodjsStatusBarManager } from './vsc/statusbar/redwoodjs_vsc_statusbar'

export async function redwoodjs_vsc(ctx: vscode.ExtensionContext) {
  // new version check. we can get rid of this once the old version
  // is removed from the store
  if (await redwoodjs_vsc_newVersionMessage(ctx)) {
    // stop all initialization
    return
  }
  redwoodjs_vsc_telemetry_reporter2(ctx)
  const manager = new RedwoodVSCProjectManager(ctx)
  ctx.subscriptions.push({
    dispose() {
      manager.stop()
    },
  })
  redwoodjs_vsc_commands_activate(ctx)
  // initialize here...

  //DEV && redwoodjs_vsc_treeview22_activate(ctx)
  return
  // const w = vscode.workspace.createFileSystemWatcher("**/redwood.toml")
  // const rwtoml_files = await vscode.workspace.findFiles("**/redwood.toml")
  // for (const rwtoml_file of rwtoml_files) {
  //   const projectRoot = dirname(rwtoml_file.fsPath)
  //   const pw = new RedwoodVSCProject({
  //     projectRoot,
  //   })
  //   break // support only one project for now
  // }
  // if (rwtoml_files.length > 0) {
  // }
  // w.onDidChange(e => {
  //   console.log("change", e.fsPath)
  // })
  // w.onDidCreate(e => {
  //   console.log("create", e.fsPath)
  // })
  // w.onDidDelete(e => {})
}

class RedwoodVSCProjectManager {
  constructor(private ctx: vscode.ExtensionContext) {
    this.tick()
  }
  stopped = false
  project: RedwoodVSCProject | undefined
  tick() {
    let rwpath = getTopLevelRWTomlPath()
    if (this.stopped) {
      rwpath = undefined
    }
    if (rwpath) {
      if (!this.project) {
        const projectRoot = dirname(rwpath)
        this.project = new RedwoodVSCProject({ ctx: this.ctx, projectRoot })
        redwoodjs_vsc_enabled_set(true)
      }
    } else {
      if (this.project) {
        this.project.dispose()
        this.project = undefined
        redwoodjs_vsc_enabled_set(false)
      }
    }
    if (!this.stopped) {
      setTimeout(() => this.tick(), 1000)
    }
  }
  stop() {
    this.stopped = true
  }
}

function redwoodjs_vsc_enabled_set(v: boolean) {
  redwoodjs_vsc_log('setContext redwoodjs_vsc_enabled = ' + v)
  vscode.commands.executeCommand('setContext', redwoodjs_vsc_enabled, v)
}

interface Opts {
  projectRoot: string
  lspServerPath?: string
  ctx: vscode.ExtensionContext
}

class RedwoodVSCProject {
  private disposables: vscode.Disposable[] = []
  constructor(public opts: Opts) {
    console.log('new RedwoodVSCProject(' + opts.projectRoot + ')')
    redwoodjs_vsc_log('new RedwoodVSCProject(' + opts.projectRoot + ')')
    this.disposables.push(new RedwoodjsStatusBarManager(opts))
    redwoodjs_vsc_telemetry_reporter2(
      this.opts.ctx
    ).event_redwoodProjectDetected({
      redwoodVersion: this.redwoodVersion ?? '',
    })
    const d1 = reaction(
      () => this.activeVSCodeFileName,
      (x) => {
        if (x) {
          this.vscodeDidNavigate(x)
        }
      }
    )
    const d2 = reaction(
      () => this.url,
      (x) => {
        if (x) {
          this.browserDidNavigate(x)
        }
      }
    )
    this.disposables.push({ dispose: d1 })
    this.disposables.push({ dispose: d2 })
    setInterval(() => {
      this.updateDecorations()
    }, 300)
    // eslint-disable-next-line no-unused-expressions
    this.lspClient // make sure client is initialized
  }

  @lazy()
  get redwoodVersion() {
    return redwoodjs_get_installed_framework_version_for_project(
      this.projectRoot
    )
  }

  @lazy()
  get projectRoot() {
    return this.opts.projectRoot
  }

  @lazy()
  get lspServerPath() {
    const p = getLSPPathForProject(this.projectRoot)
    if (!p) {
      redwoodjs_vsc_log(`could not find redwood language server`)
      throw new Error('lsp not found')
    }
    redwoodjs_vsc_log(`redwood language server path = ${p}`)
    return p
  }

  @lazy() get lspClient(): RedwoodLSPClientManager {
    return new RedwoodLSPClientManager(this.lspServerPath, this.opts.ctx)
  }

  get ctx() {
    return this.opts.ctx
  }

  private async updateDecorationsForEditor(editor: vscode.TextEditor) {
    const { document } = editor
    const { uri } = document
    if (uri.scheme !== 'file') {
      return
    }
    const info = (await this.lspClient.client?.getInfo(uri.toString())) ?? []
    const decs: { location: LSPLocation; style: string }[] = info.filter(
      (i) => i.kind === 'Decoration'
    )
    const grouped = groupBy(decs, (d) => d.style)
    const decorationTypes = redwoodjs_vsc_decoration_types()
    for (const style of Object.keys(grouped)) {
      const dt = decorationTypes[style]
      if (!dt) {
        throw new Error(`decoration type/style not found: ${style}`)
      }
      const lspRanges = grouped[style].map((s) => s.location.range)
      const vscRanges = lspRanges.map(
        (r) =>
          new vscode.Range(
            r.start.line,
            r.start.character,
            r.end.line,
            r.end.character
          )
      )
      editor.setDecorations(dt, vscRanges)
    }
  }
  private updateDecorations() {
    const { activeTextEditor } = vscode.window
    if (!activeTextEditor) {
      return
    }
    this.updateDecorationsForEditor(activeTextEditor)
  }

  private async browserDidNavigate(routePath: string) {
    if (!this.syncNav) {
      return
    }
    const filePath = await this.lspClient.client?.getFilePathForRoutePath(
      routePath
    )
    if (!filePath) {
      return
    }
    if (this.activeVSCodeFileName === filePath) {
      return
    }
    await vscode.window.showTextDocument(vscode.Uri.file(filePath), {
      viewColumn: vscode.ViewColumn.One, // TODO: figure out dynamically where to put this
      preserveFocus: true,
    })
  }

  private async vscodeDidNavigate(filePath: string) {
    if (!this.syncNav) {
      return
    }
    const path = await this.lspClient.client?.getRoutePathForFilePath(filePath)
    if (!path) {
      return
    }
    this.url = path
  }

  @computed
  get activeVSCodeFileName() {
    now(100)
    return vscode_mobx().activeTextEditor$$?.document.fileName
  }

  @observable url = ''
  @observable syncNav = false
  syncNavToggle() {
    this.syncNav = !this.syncNav
  }

  dispose() {
    this.disposables.forEach((d) => d.dispose())
  }

  // async provideHover(
  //   document: vscode.TextDocument,
  //   position: vscode.Position,
  //   token: vscode.CancellationToken
  // ): Promise<vscode.Hover | undefined> {
  //   if (this.isRoutes(document)) {
  //     //await wait(5000)
  //     const src = document.getText()
  //     const offset = document.offsetAt(position)
  //     const pw = this.createProjectWrapper()
  //     const route = pw.router.routes.find(route =>
  //       route.jsxNode.containsRange(offset, offset + 1)
  //     )
  //     if (!route) return
  //     if (!route.path) return
  //     if (route.path?.includes("{")) return
  //     const range = tsm_Node_to_Range(route.jsxNode, document)
  //     const routeURL = await redwoodjs_getPreviewUrl({
  //       routePath: route.path,
  //       projectRoot: this.projectRoot,
  //     })
  //     const thumbFilePath = await get_page_thumb(routeURL)
  //     const openCommandUri = vscode_Uri_command(
  //       package_json_commands.redwood_browser.command,
  //       [route.path]
  //     )
  //     const openCommandUri2 = vscode_Uri_command(
  //       package_json_commands.redwood_browser_external.command,
  //       [routeURL]
  //     )
  //     if (!thumbFilePath) return undefined
  //     const cacheBuster = Date.now()
  //     const imgUri = encodeURI(`file://${thumbFilePath}#${cacheBuster}`)
  //     const str1 = new vscode.MarkdownString(`![](${imgUri})`)
  //     const str2 = new vscode.MarkdownString(
  //       `Open in [External Browser](${openCommandUri2} "Open this page in an external browser")`
  //     )
  //     // const str2 = new vscode.MarkdownString(
  //     //   `Open in [VSCode Browser](${openCommandUri} "Open this page in VSCode") | [External Browser](${openCommandUri2} "Open this page in an external browser")`
  //     // )
  //     str2.isTrusted = true
  //     const hover = new vscode.Hover([str1, str2], range)
  //     return hover
  //   }
  // }
}

function getLSPPathForProject(projectRoot: string) {
  const ALDO_DEV = true
  const dev_time =
    '/Users/aldo/com.github/redwoodjs/redwood-22/packages/structure/dist/language_server/start.js'
  const normal = redwoodjs_vsc_lsp_path_for_project(projectRoot)
  const candidates: string[] = []
  if (ALDO_DEV) {
    candidates.push(dev_time)
  }
  candidates.push(normal)
  for (const ff of candidates) {
    if (existsSync(ff)) {
      return ff
    }
  }
}

function getTopLevelRWTomlPath(): string | undefined {
  const wfs = vscode.workspace.workspaceFolders
  if (!wfs) {
    return
  }
  if (wfs.length !== 1) {
    return
  }
  const w = wfs[0]
  if (!w.uri.toString().startsWith('file://')) {
    return
  } // only local files
  const rwPath = join(w.uri.fsPath, 'redwood.toml')
  if (existsSync(rwPath)) {
    return rwPath
  }
}
