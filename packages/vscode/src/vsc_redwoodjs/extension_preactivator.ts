import vscode from "vscode"
import { vsce_preactivation_logic } from "../x/vsce/vsce_preactivation_logic"

const pre = vsce_preactivation_logic(() => import("./extension"))

export async function activate(ctx: vscode.ExtensionContext) {
  pre.activate(ctx)
}

export function deactivate() {
  pre.deactivate()
}
