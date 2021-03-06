import * as vscode from "vscode"
// import { develop_locally_command_activate } from "../x/jamstackide/vsc/dev/develop_locally_command_activate"
// import { jamstackide_vsc_magic_urls } from "../x/jamstackide/vsc/magic_urls/jamstackide_vsc_magic_urls"
import { redwoodjs_vsc } from "../x/redwoodjs/redwoodjs_vsc"
// import { magic_vsc_webapp_get_port_initialize } from "../vsc/webapp/magic_vsc_webapp_get_port"

// vscode://decoupled.redwoodjs-ide/open?framework=redwood&open=web%2Fsrc%2FRoutes.js&source=create-redwood-app

export async function activate(ctx: vscode.ExtensionContext) {
  // await magic_vsc_webapp_get_port_initialize(ctx)
  redwoodjs_vsc(ctx)
  // jamstackide_vsc_magic_urls(ctx)
  // develop_locally_command_activate(ctx)
}

export function ___buildmeta___() {
  return {
    pjson: {
      activationEvents: ["*"],
      extensionDependencies: [
        "auchenberg.vscode-browser-preview",
        "GraphQL.vscode-graphql",
        //"msjsdiag.debugger-for-chrome",
      ],
    },
  }
}
