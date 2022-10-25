import http from 'node:http'
import { Koa } from './index'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

export class Context {
  req: http.IncomingMessage
  res: http.ServerResponse
  request: Koa.Request

  constructor (req: http.IncomingMessage, res: http.ServerResponse) {
    this.req = req
    this.res = res
    this.request = this.initRequest(req)
  }

  get method (): HttpMethod {
    return this.request.method as HttpMethod
  }

  get url (): string {
    return this.request.url ?? ''
  }

  get path (): string {
    return this.request.path ?? ''
  }

  get query (): Koa.JsonValue {
    return this.request.query
  }

  get body (): Koa.JsonValue {
    return this.request.jsonBody
  }

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
}
