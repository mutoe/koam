/**
 * @description You can using https://wangwl.net/static/projects/visualRegex to review your regular express source.
 */
export class PathRegexp extends RegExp {
  path: string

  constructor (path: string) {
    const regexpString = path
      .split('/')
      .filter(Boolean)
      .map(pattern => {
        pattern = replaceKeyword(pattern)
        pattern = extractNamedParams(pattern)
        pattern = prefixSlash(pattern)
        return pattern
      })
      .join('')
      .slice(1)
      .replace(/^(.*)$/, '^/?$1/?$')

    super(regexpString)
    this.path = path
  }
}

function replaceKeyword (s: string): string {
  return s.replace(/\.(?!\\)/, '\\.')
}

function extractNamedParams (s: string): string {
  return s.replace(/:([\w-]+?)(?:\((.+?)\))?(\W|\(.+\)|$)/g, (substring, m1, m2, m3) => {
    return `(?<${m1}>${m2 ? `(?:${m2})` : '[^/#?]+?'})${m3}`
  })
}

function prefixSlash (s: string): string {
  if (s.endsWith('?')) return `(?:/${s.slice(0, -1)})?`
  if (s.endsWith('+')) return `/${s.replace(/\[\^\/#\?]/, '[^#?]').slice(0, -1)}`
  if (s.endsWith('*')) return `(?:/${s.replace(/\[\^\/#\?]/, '[^#?]').slice(0, -1)})?`
  return `/${s}`
}
