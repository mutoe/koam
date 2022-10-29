export function parseQuery (queryString: string): Record<string, any> {
  if (!queryString) return {}
  const entries = [...new URLSearchParams(queryString).entries()]
  return Object.fromEntries(entries.map(([k, v]) => {
    try {
      v = JSON.parse(v)
    } catch {}
    return [k, v]
  }))
}