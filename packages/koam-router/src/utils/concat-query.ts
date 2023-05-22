import type { RouterParams } from '../index'

export function concatQuery (path: string, query?: string | RouterParams): string {
  let url = path
  if (query) {
    if (typeof query === 'string') url += `?${query.replace(/^\?/, '')}`
    else {
      const params = Object.fromEntries(Object.entries(query).map(([k, v]) => [k, String(v)]))
      url += `?${new URLSearchParams(params).toString()}`
    }
  }
  return url
}
