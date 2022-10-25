import http from 'node:http'
import { Context } from './context'

export type HttpServer = http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
export type Middleware = (ctx: Context, next: () => Promise<void>) => Promise<void> | void

export default class Application {
  private httpServer: HttpServer
  private ctx!: Context
  private middlewares: Middleware[] = []

  constructor () {
    this.middlewares.push(this.defaultResponseMiddleware)
    this.httpServer = http.createServer(this.onRequestReceive())
  }

  use (middleware: Middleware): this {
    this.middlewares.push(middleware)
    return this
  }

  listen (...arguments_: Parameters<http.Server['listen']>): HttpServer {
    return this.httpServer.listen(...arguments_)
  }

  close (...arguments_: Parameters<http.Server['close']>): HttpServer {
    return this.httpServer.close(...arguments_)
  }

  private onRequestReceive = (): http.RequestListener => {
    const firstMiddleware = this.composeMiddleware()
    return (req, res) => {
      this.ctx = new Context(req, res)
      firstMiddleware()
    }
  }

  private defaultResponseMiddleware: Middleware = async (ctx, next) => {
    await next()
    ctx.res.end()
  }

  private composeMiddleware = (): () => Middleware => {
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dispatch = (n: number): any => {
        const fn = this.middlewares[n]
        if (!fn) return Promise.resolve()
        return fn(this.ctx, dispatch.bind(undefined, n + 1))
      }
      return dispatch(0)
    }
  }
}
