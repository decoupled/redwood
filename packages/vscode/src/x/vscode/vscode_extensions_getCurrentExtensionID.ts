import { memoize } from "lodash"
import vscode from "vscode"
import { vscode_extensions_getCurrentPackageJSON } from "./vscode_extensions_getCurrentPackageJSON"

export function vscode_extensions_getCurrentExtensionID(
  ctx: vscode.ExtensionContext
): string {
  return memoized(ctx)
}

const memoized = memoize((ctx: vscode.ExtensionContext) => {
  const { publisher, name } = vscode_extensions_getCurrentPackageJSON(ctx)
  return `${publisher}.${name}`
})
