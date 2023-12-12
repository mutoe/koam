import type { HttpMethod } from '@mutoe/koam-core'
import { PathRegexp } from './utils/path-regexp'
import { safeDecodeURIComponent } from './utils/safe-decode-uri-component'

interface RouteOptions {
  name?: string
  prefix: string
}

export default class Route {
  name?: string
  path: string
  pathRegexp: PathRegexp
  methods: HttpMethod[]
  middlewares: Koa.Middleware[]
  options: RouteOptions
  paramNames: string[] = []

  constructor(path: string, methods: HttpMethod[], middleware: Koa.Middleware, options?: RouteOptions)
  constructor(path: string, methods: HttpMethod[], middlewares: Koa.Middleware[], options?: RouteOptions)
  constructor(path: string, methods: HttpMethod[], middlewares: Koa.Middleware | Koa.Middleware[], options?: RouteOptions) {
    this.options = options || { prefix: '' }
    this.path = path
    this.name = this.options.name
    this.pathRegexp = new PathRegexp(path)
    this.paramNames = this.pathRegexp.paramNames
    this.methods = methods
    this.middlewares = Array.isArray(middlewares) ? middlewares : [middlewares]
    this.options.prefix && this.setPrefix(this.options.prefix)
  }

  match(path: string): boolean {
    return this.pathRegexp.test(path)
  }

  captures(path: string, _captures: string[] = []): string[] {
    // TODO: captures is useless ?
    return path.match(this.pathRegexp)?.slice(1) || []
  }

  params(_path: string, captures: string[] = [], params: Record<string, string> = {}): Record<string, string> {
    for (let len = captures.length, i = 0; i < len; i++) {
      const paramName = this.paramNames[i]
      if (paramName) {
        const c = captures[i]
        if (c && c.length > 0)
          params[paramName] = c ? safeDecodeURIComponent(c) : c
      }
    }

    return params
  }

  param(paramName: string, fn: Koa.Middleware): this {
    const middleware: Koa.Middleware = (ctx, next) => fn.call(this, ctx, next)
    middleware.param = paramName
    const x = this.paramNames.indexOf(paramName)
    if (x > -1) {
      this.middlewares.some((m, i) => {
        if (!m.param || this.paramNames.indexOf(m.param) > x) {
          this.middlewares.splice(i, 0, middleware)
          return true
        }
        return false
      })
    }
    return this
  }

  setPrefix(prefix: string): this {
    if (this.path) {
      this.path = this.path === '/' ? prefix : `${prefix}${this.path}`
      this.pathRegexp = new PathRegexp(this.path)
      this.paramNames = this.pathRegexp.paramNames
    }
    return this
  }
}
