export function pathToRegexp (path: string): RegExp {
  path = path
    .split('/')
    .filter(Boolean)
    .map(it => it.replace(/:([\w-]+?)(\W|$)/g, '(?<$1>[^/#?]+?)$2'))
    .join('/')
  console.log(path)
  return new RegExp(`^/?${path}/?$`)
}
