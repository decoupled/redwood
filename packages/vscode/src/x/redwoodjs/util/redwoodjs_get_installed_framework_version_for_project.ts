import { join } from 'path'

import { readJSONSync } from 'fs-extra'

/**
 * gets the installed framework version
 * @param projectRoot
 */
export function redwoodjs_get_installed_framework_version_for_project(
  projectRoot: string
) {
  try {
    const pp = join(projectRoot, 'node_modules/@redwoodjs/core/package.json')
    const v = readJSONSync(pp).version
    if (typeof v === 'string') {
      return v
    }
  } catch (e) {
    return undefined
  }
}
