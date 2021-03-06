import { join } from "path"

export function redwoodjs_vsc_lsp_path_for_project(projectRoot: string) {
  return join(
    projectRoot,
    "node_modules/@redwoodjs/structure/dist/language_server/start.js"
  )
}
