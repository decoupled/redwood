import { memoize } from 'lodash'
import * as vscode from 'vscode'

const purple = '#c586c0'
const yellow = '#dcdcaa'

export const decoration_types = memoize(() => {
  const dt = vscode.window.createTextEditorDecorationType
  return {
    path_punctuation: dt({
      // use a themable color. See package.json for the declaration and default values.
      //color: "#0090FF",
      //color: "#0182E4",
      //textDecoration: "underline",
      //fontWeight: "bold",
      //fontStyle: "italic",
      opacity: '0.5',
    }),
    path_slash: dt({
      opacity: '0.7',
    }),
    path_parameter: dt({
      color: yellow,
    }),
    path_parameter_type: dt({
      color: purple,
    }),
  }
})
