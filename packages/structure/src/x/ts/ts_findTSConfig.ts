import fup from 'findup-sync'
import { memoize } from 'lodash'
import { normalize } from 'path'

export const ts_findTSOrJSConfig = memoize((path: string):
  | string
  | undefined => {
  const cwd = normalize(path)
  if (cwd !== path) return ts_findTSOrJSConfig(cwd)
  return fup(['tsconfig.json', 'jsconfig.json'], { cwd }) ?? undefined
})
