type NotObject = undefined | null | number | string | boolean | Function | symbol | any[]

export function deepMerge<T extends object, U extends object>(source: T, target: U): T & U
export function deepMerge<T extends NotObject, U>(source: T, target: U): U
export function deepMerge<T, U extends NotObject>(source: T, target: U): T
export function deepMerge<T, U>(source: T, target: U): (T & U) | U | T {
  if (source === undefined)
    return target
  if (target === undefined)
    return source
  if (typeof source !== 'object' || source === null)
    return target
  if (typeof target !== 'object' || target === null)
    return source
  const result: any = {}
  const keys = [...new Set([...Object.keys(source || {}), ...Object.keys(target || {})])]
  for (const key of keys) {
    const valueFormSource = source[key as keyof typeof source] as any
    const valueFromTarget = target[key as keyof typeof target] as any
    result[key] = deepMerge(valueFormSource, valueFromTarget)
  }
  return result
}
