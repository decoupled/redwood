import { memoize } from "lodash"
import * as vscode from "vscode"

const lightblue = "#9cdcfe"
const purple = "#c586c0"
const yellow = "#dcdcaa"

export const redwoodjs_vsc_decoration_types = memoize(() => {
  const tt = vscode.window.createTextEditorDecorationType
  return {
    path_punctuation: tt({
      // use a themable color. See package.json for the declaration and default values.
      //color: "#0090FF",
      //color: "#0182E4",
      //textDecoration: "underline",
      //fontWeight: "bold",
      //fontStyle: "italic",
      opacity: "0.5",
    }),
    path_slash: tt({
      opacity: "0.7",
    }),
    path_parameter: tt({
      color: yellow,
    }),
    path_parameter_type: tt({
      color: purple,
    }),
  }
})
