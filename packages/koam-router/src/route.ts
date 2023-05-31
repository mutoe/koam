import { HttpMethod } from '@mutoe/koam'
import { PathRegexp } from './utils/path-regexp'
import { safeDecodeURIComponent } from './utils/safe-decode-uri-component'

interface RouteOptions {
  name?: string
}

export default class Route {
  name?: string
  path: string
  pathRegexp: PathRegexp
  methods: HttpMethod[]
  middlewares: Koa.Middleware[]
  options: RouteOptions
  paramNames: string[] = []

  constructor (path: string, methods: HttpMethod[], middleware: Koa.Middleware, options?: RouteOptions)
  constructor (path: string, methods: HttpMethod[], middlewares: Koa.Middleware[], options?: RouteOptions)
  constructor (path: string, methods: HttpMethod[], middlewares: Koa.Middleware | Koa.Middleware[], options: RouteOptions = {}) {
    this.options = options
    this.path = path
    this.name = options.name
    this.pathRegexp = new PathRegexp(path)
    this.paramNames = this.pathRegexp.paramNames
    this.methods = methods
    this.middlewares = Array.isArray(middlewares) ? middlewares : [middlewares]
  }

  match (path: string): boolean {
    return this.pathRegexp.test(path)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  captures (path: string, captures: string[] = []): string[] {
    // TODO: captures is useless ?
    return path.match(this.pathRegexp)?.slice(1) || []
  }

  params (path: string, captures: string[] = [], params: Record<string, string> = {}): Record<string, string> {
    for (let len = captures.length, i = 0; i < len; i++) {
      const paramName = this.paramNames[i]
      if (paramName) {
        const c = captures[i]
        if (c && c.length > 0) {
          params[paramName] = c ? safeDecodeURIComponent(c) : c
        }
      }
    }

    return params
  }

  param (paramName: string, fn: Koa.Middleware): this {
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
}
