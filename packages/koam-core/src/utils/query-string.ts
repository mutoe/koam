export function parseQuery(queryString: string): QueryObject {
  if (!queryString)
    return {}
  const entries = [...new URLSearchParams(queryString).entries()]
  const result: QueryObject = {}
  for (let [k, v] of entries) {
    k = k.replace(/\[.*$/, '')
    if (!k)
      continue
    try {
      v = JSON.parse(v)
    }
    catch {}

    const prevValue = result[k]
    if (prevValue === undefined)
      result[k] = v
    else if (Array.isArray(prevValue))
      prevValue.push(v)
    else
      result[k] = [prevValue, v]
  }
  return result
}

export function stringifyQuery(queryObject: QueryObject): string {
  const result: string[] = []
  for (const key in queryObject) {
    let value = queryObject[key]
    if (value === null || value === undefined || value === '')
      continue
    if (!Array.isArray(value))
      value = [value]
    result.push(...value.map(it => `${key}=${it}`))
  }
  return result.join('&')
}
