import * as vscode from 'vscode'

import { redwoodjs_vsc } from './redwoodjs_vsc'

export async function activate(ctx: vscode.ExtensionContext) {
  redwoodjs_vsc(ctx)
}
