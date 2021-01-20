export { LazyGetter } from 'lazy-get-decorator'
export { Debounce as debounce, Memoize } from 'lodash-decorators'

/**
 * use this for getters
 * example:
 */
export const lazy = LazyGetter

/**
 * use this for functions
 * example:
 */
export const memo = Memoize
