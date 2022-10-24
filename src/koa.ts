import http from 'node:http'

declare namespace Koa {
  interface Context {
    req: unknown
    res: unknown
  }

  type Middleware = (ctx: Koa.Context) => void
}

export default class Koa {
  private httpServer: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
  private ctx: Koa.Context = {} as Koa.Context

  constructor () {
    this.httpServer = http.createServer()
  }

  use (middleware: Koa.Middleware): this {
    middleware(this.ctx)
    return this
  }

  listen (...arguments_: Parameters<http.Server['listen']>): void {
    this.httpServer.listen(...arguments_)
  }
}
