import * as http from 'node:http'
import * as net from 'node:net'
import { Stream } from 'node:stream'
import Application from './application'
import Context from './context'
import { HttpStatus } from './enums'
import Koa, { Request } from './index'

export default class Response {
  readonly app!: Application
  readonly context!: Context
  readonly request!: Request

  #explicitStatus = false
  #res: http.ServerResponse
  #body: any

  constructor (res: http.ServerResponse) {
    this.#res = res
  }

  get socket (): net.Socket | null { return this.#res.socket }

  get status (): HttpStatus { return this.#res.statusCode }
  set status (val: HttpStatus) {
    if (this.headerSent) return

    this.#explicitStatus = true
    this.#res.statusCode = val
  }

  get message (): string { return this.#res.statusMessage }
  set message (val: string) { this.#res.statusMessage = val }
  get length (): number | undefined {
    if (this.has('Content-Length')) {
      return Number.parseInt(String(this.get('Content-Length')), 10) || 0
    }

    const { body } = this
    if (!body || body instanceof Stream) return undefined
    if (typeof body === 'string') return Buffer.byteLength(body)
    if (Buffer.isBuffer(body)) return body.length
    return Buffer.byteLength(JSON.stringify(body))
  }

  set length (length: number | undefined) { length !== undefined && this.set('Content-Length', length) }

  get headerSent (): boolean { return this.#res.headersSent }
  get headers (): http.OutgoingHttpHeaders { return this.#res.getHeaders() }
  flushHeaders = (): void => this.#res.flushHeaders()
  has = (key: Koa.HeaderKey): boolean => this.#res.hasHeader(key as string)
  get = <T extends Koa.HeaderKey>(key: T): T extends keyof http.IncomingHttpHeaders ? http.IncomingHttpHeaders[T] : (string | undefined) =>
    this.#res.getHeader(String(key)) as any

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

  get body (): any { return this.#body }
  set body (body: any) {
    if (typeof body === 'object') {
      this.type = 'application/json'
    } else if (typeof body === 'string' && body.startsWith('<')) {
      this.type = 'text/html'
    } else {
      this.type = 'text/plain'
    }
    this.#body = body
    if (!this.#explicitStatus) {
      if (body === null || body === undefined) this.#res.statusCode = HttpStatus.NoContent
      else this.#res.statusCode = HttpStatus.Ok
    }
  }

  get type (): string {
    return this.get('content-type')?.split(/\s*;\s*/, 1).at(0) || ''
  }

  set type (val: string) {
    // TODO: use `mime-types` package to friendly set content type
    this.set('content-type', `${val}; charset=utf-8`)
  }

  redirect (action: 'back', referer?: string): void
  redirect (url: string): void
  redirect (url: 'back' | string, alt?: string): void {
    if (url === 'back') url = this.request.get('referer') || alt || '/'
    this.set('location', encodeURI(url))
    if (this.status < 300 || this.status >= 400) this.status = HttpStatus.Found
    this.type = 'text/plain'
    this.body = `Redirecting to ${url} ...`
  }

  toJSON = (): JsonValue => {
    return {
      status: this.status,
      message: this.message,
      headers: this.headers as JsonValue,
      body: this.body,
      // TODO: respond time
    }
  }

  attachment (filename?: string): void {
    const strings = ['attachment']
    if (filename) strings.push(`filename="${filename}"`)
    this.set('content-disposition', strings.join('; '))
  }
}
