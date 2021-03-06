import { memoize } from "lodash"
import ce from "command-exists"

export const yarn_or_npm = memoize((): "yarn" | "npm" | undefined => {
  if (ce.sync("yarn")) return "yarn"
  if (ce.sync("npm")) return "npm"
  return undefined
})

export function yarn_or_npm_or_fail(): "yarn" | "npm" {
  const r = yarn_or_npm()
  if (!r) throw new Error("Could not find yarn or NPM")
  return r
}
