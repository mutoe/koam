import Koa, { HttpMethod, HttpStatus, compose } from '@mutoe/koam'
import { concatQuery } from 'src/utils/concat-query'
import { PathRegexp } from 'src/utils/path-regexp'
import Matched from './matched'
import Route from './route'

type RouterPath = string | RegExp | (string | RegExp)[]
export type RouterParams = Partial<Record<string, string | number>>
type RouterUrlOptions = {
  query?: string | RouterParams
}

interface RouterOptions {
  methods?: HttpMethod[]
  prefix?: string
}

export default class Router {
  #routes: Route[] = []
  // #prefix: string = ''
  #middlewares: Koa.Middleware[] = []

  options: RouterOptions = {}

  methods: HttpMethod[] = this.options.methods ?? [
    HttpMethod.HEAD,
    HttpMethod.OPTIONS,
    HttpMethod.GET,
    HttpMethod.POST,
    HttpMethod.PUT,
    HttpMethod.PATCH,
    HttpMethod.DELETE,
  ]

  constructor (options: RouterOptions = {}) {
    this.options = options
    // this.#prefix = options.prefix ?? ''
  }

  prefix (prefix: string): void {
    console.log(prefix)
    // this.#prefix = prefix
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
    const route = this.route(name)
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
    const dispatch: Koa.Middleware = async (ctx, next): Promise<void> => {
      const { path, method } = ctx
      const matched = this.match(path, method)
      // ctx.routes = [...ctx.routes || [], ...matched.path]
      // ctx.router = this

      if (!matched.hit) return next()

      const matchedRoutes = matched.pathAndMethod
      // const mostSpecificRoute = matchedRoutes.at(-1)!

      // eslint-disable-next-line unicorn/no-array-reduce
      const routerMiddlewares = matchedRoutes.reduce<Koa.Middleware[]>((middlewares, route) => {
        middlewares.push((ctx, next) => {
          ctx.captures = route.captures(path, ctx.captures)
          ctx.params = ctx.request.params = route.params(path, ctx.captures, ctx.params)
          // ctx.routerPath = route.path
          // ctx.routerName = route.name
          // ctx._matchedRoute = route.path
          // if (route.name) {
          //   ctx._matchedRouteName = route.name
          // }
          return next()
        })

        return middlewares.concat(route.middlewares)
      }, [])

      return compose(routerMiddlewares)(ctx, next)
    }
    dispatch.router = this
    return dispatch
  }

  route (name: string): Route | undefined {
    return this.#routes.find(route => route.name === name)
  }

  private match (path: string, method?: HttpMethod): Matched {
    const matched = new Matched()
    for (const route of this.#routes) {
      if (route.match(path)) {
        matched.path.push(route)
        if (method && route.methods.includes(method)) {
          matched.pathAndMethod.push(route)
          if (route.methods.length) matched.hit = true
        }
      }
    }
    return matched
  }

  allowedMethods (): Koa.Middleware {
    return async (ctx, next) => {
      return next()
    }
  }

  use (path: string, ...middlewares: Koa.Middleware[]): this
  use (...middlewares: Koa.Middleware[]): this
  use (...args: unknown[]): this {
    console.log(args)
    // let path: string | undefined
    // let middlewares: Koa.Middleware[]
    // const first = args.at(0)
    // if (typeof first === 'string') {
    //   path = first
    //   middlewares = args.slice(1) as Koa.Middleware[]
    // } else {
    //   middlewares = args.slice() as Koa.Middleware[]
    // }

    // if (!path) {
    //   this.#middlewares.push(...middlewares)
    //   return this
    // }
    //
    // this.#middlewares.push(async (ctx: Context, next) => {
    //   ctx.assert(path)
    //   const matched = new PathRegexp(path).test(ctx.path)
    //   if (matched) {
    //     return compose(middlewares)(ctx, next)
    //   } else {
    //     return next()
    //   }
    // })
    return this
  }

  /**
   * You can get the parameter value from `ctx.params.paramName`
   */
  param (paramName: string, ...middlewares: Koa.Middleware[]): this {
    this.#middlewares.push(async (ctx, next) => {
      if (paramName in (ctx.params || {})) {
        return compose(middlewares)(ctx, next)
      } else {
        return next()
      }
    })
    return this
  }

  redirect (path: string, destination: string, status: HttpStatus.Redirect = HttpStatus.MovedPermanently): this {
    return this.all(path, (ctx, next) => {
      const route = this.route(destination)
      if (route) destination = route.path
      ctx.status = status
      ctx.redirect(destination)
      return next()
    })
  }

  all (name: string, path: RouterPath, ...middlewares: Koa.Middleware[]): this
  all (path: RouterPath, ...middlewares: Koa.Middleware[]): this
  all (pathOrName: string, ...args: any[]): this {
    for (const httpMethod of this.methods) {
      this.handleVerb([httpMethod], pathOrName, ...args)
    }
    return this
  }

  get (name: string, path: RouterPath, ...middlewares: Koa.Middleware[]): this
  get (path: RouterPath, ...middlewares: Koa.Middleware[]): this
  get (pathOrName: string, ...args: any[]): this {
    return this.handleVerb([HttpMethod.GET], pathOrName, ...args)
  }

  post (name: string, path: RouterPath, ...middlewares: Koa.Middleware[]): this
  post (path: RouterPath, ...middlewares: Koa.Middleware[]): this
  post (pathOrName: string, ...args: any[]): this {
    return this.handleVerb([HttpMethod.POST], pathOrName, ...args)
  }

  put (name: string, path: RouterPath, ...middlewares: Koa.Middleware[]): this
  put (path: RouterPath, ...middlewares: Koa.Middleware[]): this
  put (pathOrName: string, ...args: any[]): this {
    return this.handleVerb([HttpMethod.PUT], pathOrName, ...args)
  }

  patch (name: string, path: RouterPath, ...middlewares: Koa.Middleware[]): this
  patch (path: RouterPath, ...middlewares: Koa.Middleware[]): this
  patch (pathOrName: string, ...args: any[]): this {
    return this.handleVerb([HttpMethod.PATCH], pathOrName, ...args)
  }

  delete (name: string, path: RouterPath, ...middlewares: Koa.Middleware[]): this
  delete (path: RouterPath, ...middlewares: Koa.Middleware[]): this
  delete (pathOrName: string, ...args: any[]): this {
    return this.handleVerb([HttpMethod.DELETE], pathOrName, ...args)
  }

  private handleVerb (methods: HttpMethod[], name: string, path: RouterPath, ...middlewares: Koa.Middleware[]): this
  private handleVerb (methods: HttpMethod[], path: RouterPath, ...middlewares: Koa.Middleware[]): this
  private handleVerb (methods: HttpMethod[], ...args: any[]): this {
    let name: string | undefined, paths: RouterPath, middlewares: Koa.Middleware[]
    const second = args.at(1)
    if (typeof second === 'string' || second instanceof RegExp || Array.isArray(second)) {
      [name, paths, ...middlewares] = args
    } else {
      [paths, ...middlewares] = args
    }

    if (!Array.isArray(paths)) paths = [paths]
    if (paths.length === 0) throw new Error('You have to provide a path')
    return this.register(methods, name, paths, middlewares)
  }

  private register (methods: HttpMethod[], name: string | undefined, path: RouterPath, middlewares: Koa.Middleware[]): this {
    if (Array.isArray(path)) {
      for (const pathElement of path) {
        this.register(methods, name, pathElement, middlewares)
      }
      return this
    }

    this.#routes.push(new Route(
      typeof path === 'string' ? path : path.source,
      methods,
      middlewares,
      { name },
    ))
    return this
  }
}
