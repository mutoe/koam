import http from 'node:http'
import Application from 'src/application'
import { HttpMethod } from 'src/enums'
import { Context, Response } from 'src/index'
import { parseQuery } from 'src/utils'
import { stringifyQuery } from 'src/utils/query-string'

export default class Request {
  readonly app!: Application
  readonly context!: Context
  readonly response!: Response

  readonly type: string | undefined
  readonly charset: string | undefined
  path: string
  body?: any

  #req: http.IncomingMessage
  #querystring: string = ''

  constructor (req: http.IncomingMessage) {
    this.#req = req
    const [path, queryString] = req.url?.split('?') ?? []
    this.path = path
    this.querystring = queryString
    const contentType = this.get('content-type')?.split('; ')
    if (contentType) {
      const [type, ...rest] = contentType
      const others = Object.fromEntries(rest.map(it => it.split('=')))
      this.type = type
      this.charset = others.charset
    }
  }

  get socket (): http.IncomingMessage['socket'] { return this.#req.socket }

  get method (): HttpMethod { return this.#req.method as HttpMethod || '' }
  set method (val: HttpMethod) { this.#req.method = val }

  // TODO: url is host + path
  get url (): string { return this.#req.url || '' }
  // TODO: set url (val: string) { this.#req.url = val }

  get protocol (): string {
    if ((this.#req.socket as any).encrypted) return 'https'
    if (!this.app.proxy) return 'http'
    const proto = this.get('x-forwarded-proto') as string | undefined
    return proto?.split(/\s*,\s*/, 1).at(0) || 'http'
  }

  get host (): string {
    let host: string | undefined
    if (this.app.proxy) {
      host = this.get('x-forwarded-host') as string
    }
    if (!host) {
      host = this.get('host')
    }
    return host?.split(/\s*,\s*/, 1).at(0) || ''
  }

  get ips (): string[] {
    if (!this.app.proxy) return []
    let ips = (this.get(this.app.proxyIpHeader) as string | undefined)
      ?.split(/\s*,\s*/) ?? []
    if (this.app.maxIpsCount > 0) {
      ips = ips.slice(-this.app.maxIpsCount)
    }
    return ips
  }

  get ip (): string { return this.ips.at(0) || this.socket.remoteAddress || '' }

  /** Get search string. */
  get querystring (): string { return this.#querystring }
  set querystring (val: string | undefined) { this.#querystring = val?.replace(/^\?/, '') ?? '' }

  get query (): QueryObject { return parseQuery(this.#querystring) }
  set query (val: QueryObject) { this.#querystring = stringifyQuery(val) }

  get headers (): http.IncomingHttpHeaders { return this.#req.headers }

  get<T extends string>(key: T): T extends keyof http.IncomingHttpHeaders ? http.IncomingHttpHeaders[T] : (string | string[] | undefined) {
    return this.headers[key] as any
  }

  get length (): number | undefined { return this.get('content-length') ? Number(this.get('content-length')) : undefined }

  toJSON = (): JsonValue => {
    return {
      method: this.method,
      url: this.url,
      ip: this.ip,
      headers: this.headers as JsonValue,
      body: this.body,
    }
  }
}
