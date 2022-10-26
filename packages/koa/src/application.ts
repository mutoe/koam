import http from 'node:http'
import { ListenOptions } from 'node:net'
import { Context } from './context'
import { bodyParser } from './middlewares/body-parser'
import { fallbackResponse } from './middlewares/fallback-response'
import { Koa } from './index'

export type HttpServer = http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>

export default class Application {
  private readonly httpServer: HttpServer
  private ctx!: Context
  private middlewares: Koa.Middleware[] = []

  constructor () {
    this.middlewares.push(bodyParser(), fallbackResponse())
    this.httpServer = http.createServer(this.onRequestReceive())
  }

  use (middleware: Koa.Middleware): this {
    this.middlewares.push(middleware)
    return this
  }

  listen (port?: number, hostname?: string, backlog?: number, listeningListener?: () => void): HttpServer
  listen (port?: number, hostname?: string, listeningListener?: () => void): HttpServer
  listen (port?: number, backlog?: number, listeningListener?: () => void): HttpServer
  listen (port?: number, listeningListener?: () => void): HttpServer
  listen (path: string, backlog?: number, listeningListener?: () => void): HttpServer
  listen (path: string, listeningListener?: () => void): HttpServer
  listen (options: ListenOptions, listeningListener?: () => void): HttpServer
  listen (handle: any, backlog?: number, listeningListener?: () => void): HttpServer
  listen (handle: any, listeningListener?: () => void): HttpServer
  listen (...args: any[]): HttpServer {
    return this.httpServer.listen(...args)
  }

  close (callback?: (err?: Error) => void): HttpServer {
    this.ctx = null!
    this.middlewares = null!
    return this.httpServer.close(callback)
  }

  private onRequestReceive (): http.RequestListener {
    const firstMiddleware = this.composeMiddleware()
    return async (req, res) => {
      this.ctx = new Context(req, res)
      await firstMiddleware()
    }
  }

  private composeMiddleware (): Koa.MiddlewareGenerator {
    return () => {
      let n = -1
      const dispatch = (i: number): any => {
        if (n >= i) throw new Error('next() called more than one time in the same middleware function')
        n = i
        const fn = this.middlewares[i]
        if (!fn) return
        return fn(this.ctx, dispatch.bind(undefined, i + 1))
      }
      return dispatch(0)
    }
  }
}
