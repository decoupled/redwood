import { memoize } from 'lodash'
import * as vscode from 'vscode'

export function redwoodjs_vsc_log(str: string) {
  redwood_output().appendLine(str)
}

const redwood_output = memoize(() =>
  vscode.window.createOutputChannel('Redwood')
)
