/**
 * load vscode using require. using this will prevent module bundlers (like parcel)
 * from trying to bundle vscode
 */
export function vscode_(): typeof import("vscode") {
  let vv = "vscode"
  return require(vv)
}

export function vscode_or_undefined(): typeof import("vscode") | undefined {
  try {
    let vv = "vscode"
    return require(vv)
  } catch (e) {
    return undefined
  }
}
