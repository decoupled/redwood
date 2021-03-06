import { commands } from "./consts"
import * as vscode from "vscode"

export function register_commands(
  callback?: (treeItem: any, commandShortName: string) => void
) {
  Object.keys(commands)
    .filter(k => k !== "refresh")
    .forEach(k => registerCommand(k as any))
  function registerCommand(id: keyof typeof commands) {
    vscode.commands.registerCommand(commands[id].command, o =>
      callback?.(o, id)
    )
  }
}
