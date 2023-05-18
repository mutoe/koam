import Koa, { HttpMethod, HttpStatus, compose } from '@mutoe/koam'

declare global {
  interface Context {
    routes: Record<string, string>
  }
}

type RouterPath = string | RegExp | (string | RegExp)[]

export default class Router {
  #routeMap: Map<string, Koa.Middleware> = new Map()

  routes (): Koa.Middleware {
    return async (ctx, next) => {
      const { path, method } = ctx
      const handler = this.#routeMap.get(`${path}-${method}`)
      if (handler) return handler(ctx, next)
      return ctx.throw(HttpStatus.NotFound)
    }
  }

  all (name: string, path: RouterPath, ...middlewares: Koa.Middleware[]): this
  all (path: RouterPath, ...middlewares: Koa.Middleware[]): this
  all (pathOrName: string, ...args: any[]): this {
    return this.handleVerb(null, pathOrName, ...args)
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

  private handleVerb (method: HttpMethod | null, name: string, path: RouterPath, ...middlewares: Koa.Middleware[]): this
  private handleVerb (method: HttpMethod | null, path: RouterPath, ...middlewares: Koa.Middleware[]): this
  private handleVerb (method: HttpMethod | null, ...args: any[]): this {
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

  private register (method: HttpMethod | null, name: string | undefined, path: string | RegExp, middlewares: Koa.Middleware[]): this {
    this.#routeMap.set(`${path}-${method}`, compose(middlewares))
    return this
  }
}
