import { dirname, join } from 'path'

import { existsSync } from 'fs-extra'
import { LazyGetter as lazy } from 'lazy-get-decorator'
import { groupBy } from 'lodash'
import * as vscode from 'vscode'
import { Location as LSPLocation } from 'vscode-languageserver-types'

import { commands_activate } from './commands/commands_activate'
import { decoration_types } from './decoration_types'
import { log } from './log'
import { RedwoodLSPClientManager } from './lsp/lsp_client'
import { lsp_path_for_project } from './lsp/lsp_path_for_project'
import { new_version_message } from './new_version_message'
import { redwoodjs_vsc_enabled } from './redwoodjs_vsc_enabled'
import { statusbar } from './statusbar/statusbar'
import { redwoodjs_vsc_telemetry_reporter2 } from './telemetry/telemetry'
import { framework_version__installed } from './util/framework_version__installed'

export async function redwoodjs_vsc(ctx: vscode.ExtensionContext) {
  // new version check. we can get rid of this once the old version
  // is removed from the store
  if (await new_version_message(ctx)) {
    // stop all initialization
    return
  }
  redwoodjs_vsc_telemetry_reporter2(ctx)
  const manager = new RedwoodVSCProjectManager(ctx)
  ctx.subscriptions.push(manager)
  commands_activate(ctx)
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
  dispose() {
    this.stopped = true
  }
}

function redwoodjs_vsc_enabled_set(v: boolean) {
  log('setContext redwoodjs_vsc_enabled = ' + v)
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

    log('new RedwoodVSCProject(' + opts.projectRoot + ')')

    statusbar(opts)

    redwoodjs_vsc_telemetry_reporter2(
      this.opts.ctx
    ).event_redwoodProjectDetected({
      redwoodVersion: this.redwoodVersion ?? '',
    })

    setInterval(() => {
      this.updateDecorations()
    }, 300)
    // eslint-disable-next-line no-unused-expressions
    this.lspClient // make sure client is initialized
  }

  @lazy()
  get redwoodVersion() {
    return framework_version__installed(this.projectRoot)
  }

  @lazy()
  get projectRoot() {
    return this.opts.projectRoot
  }

  @lazy()
  get lspServerPath() {
    const p = getLSPPathForProject(this.projectRoot)
    if (!p) {
      log(`could not find redwood language server`)
      throw new Error('lsp not found')
    }
    log(`redwood language server path = ${p}`)
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
    const decorationTypes = decoration_types()
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

  dispose() {
    this.disposables.forEach((d) => d.dispose())
  }
}

function getLSPPathForProject(projectRoot: string) {
  const ALDO_DEV = true
  const dev_time =
    '/Users/aldo/com.github/redwoodjs/redwood-22/packages/structure/dist/language_server/start.js'
  const normal = lsp_path_for_project(projectRoot)
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