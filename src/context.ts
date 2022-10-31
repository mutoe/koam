import http from 'node:http'
import { HttpStatus } from 'src/enums/http-status'
import Request from './request'
import Response from './response'
import { Koa } from './index'

export class Context {
  /** Nodejs http server vanilla request object  */
  req: http.IncomingMessage
  /** Nodejs http server vanilla response object  */
  res: http.ServerResponse
  /** Koa request object  */
  request: Request
  /** Koa response object  */
  response: Response

  /** @deprecated Non-standard API */
  onError: (e: Error) => void | Promise<void>

  constructor (config: Koa.Config, req: http.IncomingMessage, res: http.ServerResponse) {
    this.req = req
    this.res = res
    this.request = new Request(req)
    this.response = new Response(res)
    this.onError = config.onError
  }

  get method (): Koa.HttpMethod { return this.request.method as Koa.HttpMethod }
  get host (): string | undefined { return this.request.host }
  get protocol (): string { return this.request.protocol }
  get url (): string { return this.request.url ?? '' }
  get path (): string { return this.request.path ?? '' }
  get query (): Koa.JsonValue { return this.request.query }
  get querystring (): string | undefined { return this.request.querystring }

  get body (): Koa.JsonValue { return this.response.body }
  set body (value: Koa.JsonValue) { this.response.body = value }

  get status (): HttpStatus { return this.response.status }
  set status (val: HttpStatus) { this.response.status = val }

  get headers (): http.IncomingHttpHeaders { return this.request.headers }
}
