import * as vscode from 'vscode'

import { redwoodjs_vsc } from '../x/redwoodjs/redwoodjs_vsc'

export async function activate(ctx: vscode.ExtensionContext) {
  redwoodjs_vsc(ctx)
}

export function ___buildmeta___() {
  return {
    pjson: {
      activationEvents: ['*'],
      extensionDependencies: [
        'auchenberg.vscode-browser-preview',
        'GraphQL.vscode-graphql',
        //"msjsdiag.debugger-for-chrome",
      ],
    },
  }
}
