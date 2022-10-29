/* eslint-disable max-statements-per-line */

type QueryValue = string | boolean | number | undefined

export function parseQuery (queryString: string): Record<string, QueryValue | QueryValue[]> {
  if (!queryString) return {}
  const entries = [...new URLSearchParams(queryString).entries()]
  const result: Record<string, QueryValue | QueryValue[]> = {}
  for (let [k, v] of entries) {
    k = k.replace(/\[.*$/, '')
    if (!k) continue
    try { v = JSON.parse(v) } catch {}
    const prevValue = result[k]
    if (prevValue === undefined) {
      result[k] = v
    } else if (Array.isArray(prevValue)) {
      prevValue.push(v)
    } else {
      result[k] = [prevValue, v]
    }
  }
  return result
}
