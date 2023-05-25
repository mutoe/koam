import Koa, { Context, HttpMethod, HttpStatus, compose } from '@mutoe/koam'
import { concatQuery } from 'src/utils/concat-query'
import { PathRegexp } from 'src/utils/path-regexp'

export interface Route {
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
  #routes: Route[] = []
  #prefix: string = ''
  #middlewares: Koa.Middleware[] = []
  #allowedMethods = false

  constructor (options: RouterOptions = {}) {
    this.#prefix = options.prefix ?? ''
  }

  prefix (prefix: string): void {
    this.#prefix = prefix
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
      const routes: Route[] = this.findRoute({ path })
      const route = routes.find(it => it.method === method)
      if (route) {
        ctx.params = path.match(route.pathRegexp)?.groups
        return compose([...this.#middlewares, ...route.middlewares])(ctx, next)
      }

      await next()

      if (!HttpStatus.isError(ctx.status)) {
        if (!routes.length || !this.#allowedMethods) return ctx.throw(HttpStatus.NotFound)
        const allowed = routes.map(it => it.method)
        ctx.set('Allow', allowed.join(', '))
        ctx.throw(HttpStatus.MethodNotAllowed)
      }
    }
  }

  route (name: string): Koa.Middleware | undefined {
    const middlewares = this.findRoute({ name }).at(0)?.middlewares
    return middlewares && compose(middlewares)
  }

  private findRoute (where: Partial<Pick<Route, 'path' | 'name' | 'method'>>): Route[] {
    return this.#routes.filter(it => {
      const nameCondition = where.name ? it.name === where.name : true
      const methodsCondition = where.method ? it.method === where.method : true
      const pathCondition = where.path ? it.pathRegexp.test(where.path) : true
      return nameCondition && methodsCondition && pathCondition
    })
  }

  allowedMethods (): Koa.Middleware {
    return async (ctx, next) => {
      this.#allowedMethods = true
      return next()
    }
  }

  use (path: string, ...middlewares: Koa.Middleware[]): this
  use (...middlewares: Koa.Middleware[]): this
  use (...args: unknown[]): this {
    let path: string | undefined
    let middlewares: Koa.Middleware[]
    const first = args.at(0)
    if (typeof first === 'string') {
      path = first
      middlewares = args.slice(1) as Koa.Middleware[]
    } else {
      middlewares = args.slice() as Koa.Middleware[]
    }

    if (!path) {
      this.#middlewares.push(...middlewares)
      return this
    }

    this.#middlewares.push(async (ctx: Context, next) => {
      ctx.assert(path)
      const matched = new PathRegexp(path).test(ctx.path)
      if (matched) {
        return compose(middlewares)(ctx, next)
      } else {
        return next()
      }
    })
    return this
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
      const existingRoute = this.#routes.findIndex(it => it.name === name)
      existingRoute >= -1 && this.#routes.splice(existingRoute, 1)
    }
    this.#routes.push({
      name,
      path: this.#prefix + (typeof path === 'string' ? path : path.source),
      pathRegexp,
      middlewares,
      method,
    })
    return this
  }
}
