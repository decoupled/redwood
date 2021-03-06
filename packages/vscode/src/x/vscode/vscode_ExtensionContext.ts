import { ExtensionContext } from "vscode"

let _ec: ExtensionContext | undefined

/**
 * At any given point in time there is only one vscode.ExtensionContext
 * Instead of passing it around (ex: activate(context)), we could just store it globally and then refer to it
 * throughout the codebase.
 */
export function vscode_ExtensionContext_current(): ExtensionContext {
  if (!_ec)
    throw new Error(
      "global instance of vscode.ExtensionContext not found." +
        " Did you forget to call vscode_ExtensionContext_store()?"
    )
  return _ec
}

export function vscode_ExtensionContext_store(
  ec: ExtensionContext,
  silent = false
): void {
  if (_ec)
    if (!silent)
      throw new Error(
        "vscode.ExtensionContext already stored." +
          " This function should only be called once on activate()"
      )
  _ec = ec
}
