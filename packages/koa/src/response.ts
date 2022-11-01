import http from 'node:http'
import Application from 'src/application'
import { Context } from 'src/context'
import { HttpStatus } from 'src/enums/http-status'
import { Koa } from 'src/index'

export default class Response {
  readonly app: Application
  readonly context: Context
  body: any

  #res: http.ServerResponse

  constructor (app: Application, res: http.ServerResponse) {
    this.app = app
    this.context = app.context!
    this.#res = res
  }

  get status (): HttpStatus { return this.#res.statusCode }
  set status (val: HttpStatus) { this.#res.statusCode = val }

  get headerSent (): boolean { return this.#res.headersSent }
  get headers (): http.OutgoingHttpHeaders { return this.#res.getHeaders() }
  flushHeaders = (): void => this.#res.flushHeaders()
  has = (key: Koa.HeaderKey): boolean => this.#res.hasHeader(key as string)
  get = (key: Koa.HeaderKey): Koa.HeaderValue | undefined =>
    this.#res.getHeader(key as string)

  set = (key: Koa.HeaderKey, value: Koa.HeaderValue): this => {
    if (this.headerSent) return this
    this.#res.setHeader(String(key), value)
    return this
  }

  append = (key: Koa.HeaderKey, val: Koa.HeaderValue): this => {
    if (this.headerSent) return this
    const prev = this.get(key)
    if (prev) {
      if (!Array.isArray(val)) val = [String(val)]
      val = Array.isArray(prev)
        ? [...prev, ...val]
        : [String(prev), ...val]
    }
    return this.set(key, val)
  }

  remove (key: Koa.HeaderKey): this {
    if (this.headerSent) return this
    this.#res.removeHeader(String(key))
    return this
  }
}
