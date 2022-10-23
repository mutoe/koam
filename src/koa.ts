import http from 'node:http'

export default class Koa {
  private httpServer: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>

  constructor () {
    this.httpServer = http.createServer()
  }

  listen (...arguments_: Parameters<http.Server['listen']>): void {
    this.httpServer.listen(...arguments_)
  }
}
