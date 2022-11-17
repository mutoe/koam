export function pathToRegexp (path: string): RegExp {
  const regexpString = path
    .split('/')
    .filter(Boolean)
    .map(pattern => {
      pattern = extractNamedParams(pattern)
      pattern = prefixSlash(pattern)
      return pattern
    })
    .join('')
    .slice(1)
  return new RegExp(`^/?${regexpString}/?$`)
}

function extractNamedParams (s: string): string {
  return s.replace(/:([\w-]+?)(\W|$)/g, '(?<$1>[^/#?]+?)$2')
}

function prefixSlash (s: string): string {
  if (s.endsWith('?')) return `(?:/${s.slice(0, -1)})?`
  return `/${s}`
}
