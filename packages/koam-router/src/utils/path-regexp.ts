import type { RouterParams } from '../index'

/**
 * @description You can using https://wangwl.net/static/projects/visualRegex to review your regular express source.
 */
export class PathRegexp extends RegExp {
  path?: string
  paramNames: string[]

  constructor (path: string | RegExp) {
    const paramNames: string[] = []
    if (path instanceof RegExp) {
      super(path)
      this.paramNames = []
      return
    }
    const regexpString = path
      .split('/')
      .filter(Boolean)
      .map(pattern => {
        pattern = replaceKeyword(pattern)
        pattern = extractNamedParams(pattern, paramNames)
        pattern = prefixSlash(pattern)
        return pattern
      })
      .join('')
      .replace(/^(\/)?(.*)$/, '^/?$2/?$')

    super(regexpString)
    this.paramNames = paramNames
    this.path = path
  }

  toPath (params: RouterParams | (string | number)[]): string {
    if (!this.path) throw new Error('Route path not have initial value')
    if (Array.isArray(params)) {
      let result = this.path
      while (params.length) {
        const value = String(params.shift())
        result = result.replace(/:([\w-]+?)(?:\((.+?)\))?(\W|\(.+\))?([-./]|$)/, `${value}$4`)
      }
      return result
    }
    return this.path
      .split('/')
      .map(subpath => {
        subpath = subpath.replace(/:([\w-]+?)(?:\((.+?)\))?(\W|\(.+\)|$)/g, (substring, name, customPattern, modifier) => {
          const value = params[name]
          if (!(name in params) || value === undefined) return substring
          if (customPattern && !RegExp(customPattern).test(String(value))) return substring
          return String(value) + modifier
        })
        subpath = prefixSlash(subpath)
        return subpath
      })
      .join('')
      .slice(1)
  }
}

function replaceKeyword (s: string): string {
  // Replace `.` to `\.` but do not replace `\.` twice
  return s.replace(/\.(?!\\)/, '\\.')
}

function extractNamedParams (s: string, paramNames: string[] = []): string {
  return s.replace(/:([\w-]+?)(?:\((.+?)\))?(\W|\(.+\)|$)/g, (substring, name, customPattern, modifier) => {
    paramNames.push(name)
    return `(?<${name}>${customPattern ? `(?:${customPattern})` : '[^/#?]+?'})${modifier}`
  })
}
function prefixSlash (s: string): string {
  if (s === '*') return '.*'
  if (s === '+') return '.+'
  if (s.endsWith('?')) return `(?:/${s.slice(0, -1)})?`
  if (s.endsWith('+') && !s.startsWith('(')) return s.replace(/^(.*?)\+$/, '(?:/$1)+')
  if (s.endsWith('+')) return `/${s.replace(/\[\^\/#\?]/, '[^#?]').slice(0, -1)}`
  if (s.endsWith('*') && !s.startsWith('(')) return s.replace(/^(.*?)\*$/, '(?:/$1)*')
  if (s.endsWith('*')) return `(?:/${s.replace(/\[\^\/#\?]/, '[^#?]').slice(0, -1)})?`
  return `/${s}`
}
