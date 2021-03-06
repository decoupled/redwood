import { ensureDir } from "fs-extra"
import { values } from "lodash"
import { Memoize as memo } from "lodash-decorators"
import { basename, join } from "path"
import { quote } from "shell-quote"
import vscode from "vscode"
import { vscode_ExtensionContext_current } from "../../../vscode/vscode_ExtensionContext"
import { vscode_run } from "../../../vscode/vscode_run"

export function redwoodjs_vsc_erd() {
  const ctx = vscode_ExtensionContext_current()
  vscode.commands.registerCommand(
    commands.show_erd.command,
    async (uri?: vscode.Uri) => {
      new ShowDiagram({ uri, ctx }).run()
    }
  )
}

class ShowDiagram {
  constructor(
    public opts: { uri?: vscode.Uri; ctx: vscode.ExtensionContext }
  ) {}

  async run() {
    try {
      await this._run()
    } catch (e) {
      vscode.window.showErrorMessage(String(e))
    }
  }

  @memo() private async getPrismaSchemaURI() {
    if (this.opts.uri) return this.opts.uri
    // search for a prisma URI in the workspace
    const uris = await vscode.workspace.findFiles(
      "**​/*.prisma",
      "**​/node_modules/**",
      10
    )
    const items = uris.map(uri => {
      return {
        label: basename(uri.fsPath),
        detail: uri.fsPath,
        uri,
      }
    })
    const picked = await vscode.window.showQuickPick(items, {
      placeHolder: "pick a prisma file",
    })
    if (!picked) return undefined
    return picked.uri
  }

  private ext = "png" // svg
  private async _run() {
    const uri = await this.getPrismaSchemaURI()
    if (!uri) return
    const outFile = await this.getOutFile()
    //const cmd = `npx prisma-uml ./api/prisma/schema.prisma -o svg -f prisma-schema.svg`
    // https://github.com/emyann/prisma-uml
    const cmd = ["npx", "prisma-uml", uri.fsPath, "-o", this.ext, "-f", outFile]
    const cmd_quoted = quote(cmd)
    await vscode_run({ cmd: cmd_quoted })
    //const res = await execa("npx", args)
    vscode.env.openExternal(vscode.Uri.file(outFile))
  }
  @memo() private async getOutFile() {
    return join(await this.getStorageDir(), `schema.prisma.${this.ext}`)
  }
  @memo() private async getStorageDir() {
    const storageDir = this.opts.ctx.storageUri?.fsPath
    if (!storageDir) throw new Error("ctx.storageUri not found")
    await ensureDir(storageDir)
    return storageDir
  }
}

export function ___buildmeta___() {
  return {
    pjson: {
      contributes: {
        commands: values(commands),
        languages: [
          {
            id: "prisma",
            extensions: [".prisma"],
          },
        ],
        menus: {
          "explorer/context": [
            {
              when: when_prisma,
              command: commands.show_erd.command,
              group: "7_modification",
            },
          ],
        },
      },
    },
  }
}

const when_prisma = "resourceLangId == prisma"

const commands = {
  show_erd: {
    command: "redwoodjs.show-erd",
    title: "Show ERD (Entity Relationship Diagram)",
  },
}
