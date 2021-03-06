import { LazyGetter as lazy } from "lazy-get-decorator"
import { values } from "lodash"
import { Memoize as memo } from "lodash-decorators"
import { computed, observable, reaction } from "mobx"
import { now } from "mobx-utils"
import vscode from "vscode"
import { redwoodjs_get_installed_framework_version_for_project } from "../../util/redwoodjs_get_installed_framework_version_for_project"
import { redwoodjs_get_latest_version } from "../../util/redwoodjs_get_latest_version"

export class RedwoodjsStatusBarManager {
  private disposables: vscode.Disposable[] = []
  constructor(
    private opts: { ctx: vscode.ExtensionContext; projectRoot: string }
  ) {
    const d1 = vscode.commands.registerCommand(
      commandss.show_new_version_message.command,
      async () => {
        if (!this.installedFrameworkVersion) return
        const m = this.newerVersionIsAvailable
          ? "A newer version of Redwood is available"
          : "You are using the latest Redwood version"
        vscode.window.showInformationMessage(m)
      }
    )
    this.disposables.push(d1)

    const d2 = reaction(
      () => this.statusBarItemText,
      x => {
        this.statusBarItem.text = x
      },
      { fireImmediately: true }
    )

    this.disposables.push({ dispose: d2 })

    this.fetchLatestVersion()
  }

  @memo()
  dispose() {
    this.disposables.forEach(d => d.dispose())
  }

  @computed
  get installedFrameworkVersion() {
    const v = redwoodjs_get_installed_framework_version_for_project(
      this.opts.projectRoot
    )
    now(v ? 3000 : 1000)
    return v
  }

  @observable latestVersion: string | undefined
  private async fetchLatestVersion() {
    this.latestVersion = await redwoodjs_get_latest_version()
  }

  @computed get newerVersionIsAvailable() {
    if (!this.latestVersion) return false
    if (!this.installedFrameworkVersion) return false
    return this.latestVersion !== this.installedFrameworkVersion
  }

  @computed
  get statusBarItemText() {
    const v = this.installedFrameworkVersion
    if (!v) return "Redwood"
    const icon = `$(info)`
    if (this.newerVersionIsAvailable) {
      return `Redwood ${v} ${icon}`
    }
    return `Redwood ${v}`
  }

  @lazy() get statusBarItem() {
    const si = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    )
    si.text = this.statusBarItemText
    si.command = commandss.show_new_version_message.command
    si.show()
    this.disposables.push(si)
    return si
  }
}

const commandss = {
  show_new_version_message: {
    command: "_decoupled.redwoodjs-ide.show_new_version_message",
    title: "show new version message",
  },
}

export function ___buildmeta___() {
  const commands = values(commandss)
  return {
    pjson: {
      contributes: {
        commands,
      },
    },
  }
}
