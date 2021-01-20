import type { PluginObj, types } from '@babel/core'

import { RWProject } from '@redwoodjs/structure'

interface PluginOptions {
  project: RWProject
}

export default function (babel, { project }: PluginOptions): PluginObj {
  const t: typeof types = babel.types
  return {
    name: 'ast-transform', // not required
    visitor: {
      ArrowFunctionExpression(path) {
        const { parent } = path
        if (!t.isVariableDeclarator(parent)) return
        const id = parent.id
        if (!t.isIdentifier(id)) return
        const name = id.name
        if (name !== 'Routes')
          return // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(path.get('body') as any).unshiftContainer('body', getASTToInsert())
      },
      FunctionDeclaration(path) {
        if (path.node.id.name == 'Routesb') {
          path.get('body').unshiftContainer('body', getASTToInsert())
        }
      },
    },
  }

  function getASTToInsert() {
    //     const x = `
    // switch(arguments[0]){
    // case "key1":
    //   return "KEY1";
    //    }
    // `
    const x = project.router.switchStatementForAlternateReturns
    const z = babel.parse(`function bbb(){${x}}`)
    return z.program.body[0].body.body[0]
  }
}
