import Koa, { HttpMethod, HttpStatus, compose } from '@mutoe/koam'
import { concatQuery } from 'src/utils/concat-query'
import { PathRegexp } from 'src/utils/path-regexp'

interface Route {
  path: string
  pathRegexp: PathRegexp
  method: HttpMethod
  name?: string
  middlewares: Koa.Middleware[]
}

type RouterPath = string | RegExp | (string | RegExp)[]
export type RouterParams = Partial<Record<string, string | number>>
type RouterUrlOptions = {
  query?: string | RouterParams
}

interface RouterOptions {
  prefix?: string
}

export default class Router {
  #route: Route[] = []
  #prefix: string = ''

  constructor (options: RouterOptions = {}) {
    this.#prefix = options.prefix ?? ''
  }

  url (name: string, ...params: (string | number)[]): string
  url (name: string, ...params: [...(string | number)[], RouterUrlOptions]): string
  url (name: string, params: RouterParams, options?: RouterUrlOptions): string
  url (name: string, ...paramOrOptions: unknown[]): string {
    let options: RouterUrlOptions = {}
    let params: (string | number)[] | RouterParams
    const first = paramOrOptions.at(0)
    if (typeof first === 'object') {
      params = first as RouterParams
      paramOrOptions.shift()
    }
    const last = paramOrOptions.at(-1)
    if (typeof last === 'object') {
      options = last as RouterUrlOptions
      paramOrOptions.pop()
    }
    params ||= paramOrOptions as (string | number)[]
    const route = this.findRoute({ name }).at(0)
    if (!route) throw new Error(`Route "${name}" not found`)
    const url = route.pathRegexp.toPath(params)
    return concatQuery(url, options?.query)
  }

  static url (path: string, ...params: (string | number)[]): string
  static url (path: string, ...params: [...(string | number)[], RouterUrlOptions]): string
  static url (path: string, params: RouterParams, options?: RouterUrlOptions): string
  static url (path: string, ...paramOrOptions: unknown[]): string {
    let options: RouterUrlOptions = {}
    let params: (string | number)[] | RouterParams
    const first = paramOrOptions.at(0)
    if (typeof first === 'object') {
      params = first as RouterParams
      paramOrOptions.shift()
    }
    const last = paramOrOptions.at(-1)
    if (typeof last === 'object') {
      options = last as RouterUrlOptions
      paramOrOptions.pop()
    }
    params ||= paramOrOptions as (string | number)[]
    const url = new PathRegexp(path).toPath(params)
    return concatQuery(url, options?.query)
  }

  routes (): Koa.Middleware {
    return async (ctx, next): Promise<void> => {
      const { path, method } = ctx
      const routes = this.findRoute({ path })
      if (!routes.length) return ctx.throw(HttpStatus.NotFound)
      const route = routes.find(it => it.method === method)
      if (!route) return ctx.throw(HttpStatus.MethodNotAllowed)
      ctx.params = path.match(route.pathRegexp)?.groups
      return compose(route.middlewares)(ctx, next)
    }
  }

  route (name: string): Koa.Middleware | undefined {
    const middlewares = this.findRoute({ name }).at(0)?.middlewares
    return middlewares && compose(middlewares)
  }

  private findRoute (where: Partial<Pick<Route, 'path' | 'name' | 'method'>>): Route[] {
    return this.#route.filter(it => {
      const nameCondition = where.name ? it.name === where.name : true
      const methodsCondition = where.method ? it.method === where.method : true
      const pathCondition = where.path ? it.pathRegexp.test(where.path) : true
      return nameCondition && methodsCondition && pathCondition
    })
  }

  all (name: string, path: RouterPath, ...middlewares: Koa.Middleware[]): this
  all (path: RouterPath, ...middlewares: Koa.Middleware[]): this
  all (pathOrName: string, ...args: any[]): this {
    const allMethods = [
      HttpMethod.GET,
      HttpMethod.POST,
      HttpMethod.PUT,
      HttpMethod.PATCH,
      HttpMethod.DELETE,
      HttpMethod.OPTIONS,
      HttpMethod.HEAD,
    ]
    for (const httpMethod of allMethods) {
      this.handleVerb(httpMethod, pathOrName, ...args)
    }
    return this
  }

  head (name: string, path: RouterPath, ...middlewares: Koa.Middleware[]): this
  head (path: RouterPath, ...middlewares: Koa.Middleware[]): this
  head (pathOrName: string, ...args: any[]): this {
    return this.handleVerb(HttpMethod.HEAD, pathOrName, ...args)
  }

  options (name: string, path: RouterPath, ...middlewares: Koa.Middleware[]): this
  options (path: RouterPath, ...middlewares: Koa.Middleware[]): this
  options (pathOrName: string, ...args: any[]): this {
    return this.handleVerb(HttpMethod.OPTIONS, pathOrName, ...args)
  }

  get (name: string, path: RouterPath, ...middlewares: Koa.Middleware[]): this
  get (path: RouterPath, ...middlewares: Koa.Middleware[]): this
  get (pathOrName: string, ...args: any[]): this {
    return this.handleVerb(HttpMethod.GET, pathOrName, ...args)
  }

  post (name: string, path: RouterPath, ...middlewares: Koa.Middleware[]): this
  post (path: RouterPath, ...middlewares: Koa.Middleware[]): this
  post (pathOrName: string, ...args: any[]): this {
    return this.handleVerb(HttpMethod.POST, pathOrName, ...args)
  }

  put (name: string, path: RouterPath, ...middlewares: Koa.Middleware[]): this
  put (path: RouterPath, ...middlewares: Koa.Middleware[]): this
  put (pathOrName: string, ...args: any[]): this {
    return this.handleVerb(HttpMethod.PUT, pathOrName, ...args)
  }

  patch (name: string, path: RouterPath, ...middlewares: Koa.Middleware[]): this
  patch (path: RouterPath, ...middlewares: Koa.Middleware[]): this
  patch (pathOrName: string, ...args: any[]): this {
    return this.handleVerb(HttpMethod.PATCH, pathOrName, ...args)
  }

  delete (name: string, path: RouterPath, ...middlewares: Koa.Middleware[]): this
  delete (path: RouterPath, ...middlewares: Koa.Middleware[]): this
  delete (pathOrName: string, ...args: any[]): this {
    return this.handleVerb(HttpMethod.DELETE, pathOrName, ...args)
  }

  private handleVerb (method: HttpMethod, name: string, path: RouterPath, ...middlewares: Koa.Middleware[]): this
  private handleVerb (method: HttpMethod, path: RouterPath, ...middlewares: Koa.Middleware[]): this
  private handleVerb (method: HttpMethod, ...args: any[]): this {
    let name: string | undefined, path: RouterPath, middlewares: Koa.Middleware[]
    if (typeof args.at(1) === 'string'
      || args.at(1) instanceof RegExp
      || Array.isArray(args.at(1))) {
      [name, path, ...middlewares] = args
    } else {
      [path, ...middlewares] = args
    }
    if (Array.isArray(path)) {
      const paths = path
      if (paths.length === 0) throw new Error('You have to provide a path')
      for (const path of paths) {
        if (name) {
          this.handleVerb(method, name, path, ...middlewares)
        }
        this.handleVerb(method, path, ...middlewares)
      }
      return this
    }
    return this.register(method, name, path, middlewares)
  }

  private register (method: HttpMethod, name: string | undefined, path: string | RegExp, middlewares: Koa.Middleware[]): this {
    const pathRegexp = typeof path === 'string'
      ? new PathRegexp(this.#prefix + path)
      : path.source.startsWith('^')
        ? new PathRegexp(`^${this.#prefix}${path.source.slice(1)}`)
        : new PathRegexp(path)
    if (name) {
      const existingRoute = this.#route.findIndex(it => it.name === name)
      existingRoute >= -1 && this.#route.splice(existingRoute, 1)
    }
    this.#route.push({
      name,
      path: this.#prefix + (typeof path === 'string' ? path : path.source),
      pathRegexp,
      middlewares,
      method,
    })
    return this
  }
}
