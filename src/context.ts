import http from 'node:http'
import { HttpStatus } from 'src/enums/http-status'
import { parseQuery } from 'src/utils/query-string'
import { Koa } from './index'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

export class Context {
  /** Nodejs http server vanilla request object  */
  req: http.IncomingMessage
  /** Nodejs http server vanilla response object  */
  res: http.ServerResponse
  /** Koa request object  */
  request: Koa.Request
  /** Koa response object  */
  response: Koa.Response

  /** @deprecated Non-standard API */
  onError: (e: Error) => void | Promise<void>

  constructor (config: Koa.Config, req: http.IncomingMessage, res: http.ServerResponse) {
    this.req = req
    this.res = res
    this.request = this.initRequest(req)
    this.response = this.initResponse(res)
    this.onError = config.onError
  }

  get method (): HttpMethod { return this.request.method as HttpMethod }
  get url (): string { return this.request.url ?? '' }
  get path (): string { return this.request.path ?? '' }
  get query (): Koa.JsonValue { return this.request.query }

  get body (): Koa.JsonValue { return this.response.body }
  set body (value: Koa.JsonValue) { this.response.body = value }

  get status (): HttpStatus { return this.response.status }
  set status (val: HttpStatus) { this.response.status = val }

  private initRequest (req: http.IncomingMessage): Koa.Request {
    const [path, queryString] = this.req.url?.split('?') ?? []
    return {
      method: req.method?.toUpperCase(),
      url: req.url,
      path,
      query: parseQuery(queryString),
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private initResponse (res: http.ServerResponse): Koa.Response {
    return {
      status: HttpStatus.Ok,
      body: null,
    }
  }
}
