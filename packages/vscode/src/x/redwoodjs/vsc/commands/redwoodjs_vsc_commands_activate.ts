import { values } from 'lodash'
import vscode from 'vscode'

import { redwoodjs_vsc_enabled } from '../redwoodjs_vsc_enabled'

import { redwoodjs_vsc_commands } from './redwoodjs_vsc_commands'

export function redwoodjs_vsc_commands_activate(ctx: vscode.ExtensionContext) {
  const { registerCommand, executeCommand } = vscode.commands
  const c = redwoodjs_vsc_commands
  ctx.subscriptions.push(
    // registerCommand(c.redwood_dev.command, async () => {
    //   executeCommand("redwoodjs.cli", "dev open=/")
    // }),
    // registerCommand(c.redwood_dev_current.command, async () => {
    //   // TODO: get current file
    //   executeCommand("redwoodjs.cli", "dev open=/")
    // }),
    registerCommand(c.redwood_generate.command, async () => {
      // TODO: get current file
      executeCommand('redwoodjs.cli', 'generate...')
    }),
    // registerCommand(c.redwood_graphql.command, async () => {
    //   // TODO: get current file
    //   //executeCommand("redwoodjs.cli", "generate...")
    // }),
    registerCommand(c.redwood_outline.command, async () => {
      // TODO: reveal outline
      //executeCommand("redwoodjs.cli", "generate...")
    })
    // registerCommand(c.redwood_storybook.command, async () => {
    //   // TODO: reveal outline
    //   executeCommand("redwoodjs.cli", "storybook open")
    // }),
    // registerCommand(c.redwood_storybook_current.command, async () => {
    //   executeCommand("redwoodjs.cli", "storybook open=/")
    // })
  )

  // registerCommand(c.redwood_debug.command, async () => {
  //   const wf = (vscode.workspace.workspaceFolders ?? [])[0]
  //   if (!wf) return
  //   const base = wf.uri.fsPath
  //   const runtimeExecutable = join(base, "node_modules/.bin/babel-node")
  //   const program = join(
  //     base,
  //     "node_modules/@redwoodjs/dev-server/dist/dev-server2.js"
  //   )
  //   const cfg1: vscode.DebugConfiguration = {
  //     type: "node",
  //     request: "launch",
  //     name: "Redwood Api (Functions)",
  //     cwd: join(base, "api"),
  //     skipFiles: ["<node_internals>/**"],
  //     sourceMaps: true,
  //     runtimeExecutable,
  //     program,
  //   }
  //   await vscode.debug.startDebugging(undefined, cfg1)
  //   // launch web
  //   if (false) {
  //     execa("yarn rw dev web", { cwd: base })
  //   } else {
  //     const t = vscode.window.createTerminal({
  //       name: "yarn rw dev web",
  //       cwd: base,
  //     })
  //     executeCommand("workbench.action.terminal.clear")
  //     t.sendText("clear")
  //     t.sendText("clear")
  //     t.show()
  //     t.sendText(`yarn rw dev web --fwd="--open=false"`)
  //   }
  //   await wait(3000)
  //   const cfg2 = {
  //     name: "Redwood Web (Chrome)",
  //     request: "launch",
  //     type: "pwa-chrome",
  //     url: "http://localhost:8910/",
  //     webRoot: base,
  //   }
  //   await vscode.debug.startDebugging(undefined, cfg2)
  // })
}

export function ___buildmeta___() {
  const commands = values(redwoodjs_vsc_commands)
  const command_ids = commands.map((c) => c.command)
  // only enable when in a redwood project
  const commandPalette = command_ids.map((command) => ({
    command,
    when: redwoodjs_vsc_enabled + '==true',
  }))
  return {
    pjson: {
      contributes: {
        commands,
        menus: {
          commandPalette,
        },
      },
    },
  }
}
