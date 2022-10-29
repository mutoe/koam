import http from 'node:http'
import { HttpStatus } from 'src/enums/http-status'
import { Koa } from './index'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

export class Context {
  req: http.IncomingMessage
  res: http.ServerResponse
  request: Koa.Request
  response: Koa.Response
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
  get body (): Koa.JsonValue { return this.request.jsonBody }

  get status (): HttpStatus { return this.response.status }
  set status (val: HttpStatus) { this.response.status = val }

  private parseQuery (queryString: string): Record<string, any> {
    if (!queryString) return {}
    const entries = [...new URLSearchParams(queryString).entries()]
    return Object.fromEntries(entries.map(([k, v]) => {
      try {
        v = JSON.parse(v)
      } catch {}
      return [k, v]
    }))
  }

  private initRequest (req: http.IncomingMessage): Koa.Request {
    const [path, queryString] = this.req.url?.split('?') ?? []
    return {
      method: req.method?.toUpperCase(),
      url: req.url,
      path,
      query: this.parseQuery(queryString),
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private initResponse (res: http.ServerResponse): Koa.Response {
    return {
      status: HttpStatus.Ok,
    }
  }
}
