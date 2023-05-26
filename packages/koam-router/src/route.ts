import { HttpMethod } from '@mutoe/koam'
import { PathRegexp } from './utils/path-regexp'

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

  constructor (path: string, methods: HttpMethod[], middleware: Koa.Middleware, options?: RouteOptions)
  constructor (path: string, methods: HttpMethod[], middlewares: Koa.Middleware[], options?: RouteOptions)
  constructor (path: string, methods: HttpMethod[], middlewares: Koa.Middleware | Koa.Middleware[], options: RouteOptions = {}) {
    this.options = options
    this.path = path
    this.name = options.name
    this.pathRegexp = new PathRegexp(path)
    this.methods = methods
    this.middlewares = Array.isArray(middlewares) ? middlewares : [middlewares]
  }

  match (path: string): boolean {
    return this.pathRegexp.test(path)
  }
}
