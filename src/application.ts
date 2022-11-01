import http from 'node:http'
import { ListenOptions } from 'node:net'
import { Context } from './context'
import { HttpStatus } from './enums/http-status'
import { bodyParser } from './middlewares/body-parser'
import { deepMerge } from './utils/deep-merge'
import { Koa } from './index'

export type HttpServer = http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>

export default class Application {
  context: Context | null = null
  readonly config: Koa.Config = {
    proxy: false,
    proxyIpHeader: 'x-forwarded-for',
    maxIpsCount: 0,
    onError: (error: Error) => console.error(error),
  }

  private readonly httpServer: HttpServer
  private middlewares: Koa.Middleware[] = []

  constructor (config: Partial<Koa.Config> = {}) {
    this.config = deepMerge(this.config, config)
    this.middlewares.push(bodyParser())
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
    this.context = null!
    this.middlewares = null!
    return this.httpServer.close(callback)
  }

  private onRequestReceive (): http.RequestListener {
    const middleware = this.composeMiddleware()
    return async (req, res) => {
      this.context = new Context(this, req, res)
      try {
        await middleware()
      } catch (error) {
        const err = error instanceof Error ? error : new Error(error?.toString())
        this.context.onError(err)
        if (HttpStatus.is2xxSuccess(this.context.status)) {
          this.context.status = HttpStatus.InternalServerError
        }
      }
      if (this.context.body !== undefined && this.context.body !== null) {
        this.context.res.write(JSON.stringify(this.context.body))
      }
      this.context.res.statusCode = this.context.status
      this.context.res.end()
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
        return fn(this.context!, dispatch.bind(undefined, i + 1))
      }
      return dispatch(0)
    }
  }
}
