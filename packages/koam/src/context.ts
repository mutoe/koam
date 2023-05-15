/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import http from 'node:http'
import { HttpMethod, HttpStatus } from './enums'
import Request from './request'
import Response from './response'
import Koa, { AppError, Application } from './index'

// noinspection JSConstantReassignment
export default class Context {
  readonly app: Application
  /** Nodejs http server vanilla request object  */
  readonly req: http.IncomingMessage
  /** Nodejs http server vanilla response object  */
  readonly res: http.ServerResponse
  /** Koa request object  */
  readonly request: Request
  /** Koa response object  */
  readonly response: Response
  /** Custom properties */
  state: Koa.State = {}

  constructor (app: Application, req: http.IncomingMessage, res: http.ServerResponse) {
    this.app = app
    this.req = req
    this.res = res
    this.request = new Request(req)
    this.response = new Response(res)
    // @ts-expect-error lazy init property
    this.request.response = this.response
    // @ts-expect-error lazy init property
    this.response.request = this.request
    // @ts-expect-error lazy init property
    this.request.app = this.response.app = this.app
    // @ts-expect-error lazy init property
    this.request.context = this.response.context = this
  }

  get socket () { return this.request.socket }
  get ip () { return this.request.ip }
  get ips () { return this.request.ips }

  get method () { return this.request.method }
  set method (val: HttpMethod) { this.request.method = val }

  get host () { return this.request.host }
  get protocol () { return this.request.protocol }
  get origin () { return this.request.origin }
  get url () { return this.request.url }
  get originalUrl () { return this.request.originalUrl }

  get path () { return this.request.path }
  set path (val: string) { this.request.path = val }

  get query () { return this.request.query }
  set query (val: QueryObject) { this.request.query = val }

  get querystring () { return this.request.querystring }
  set querystring (val: string) { this.request.querystring = val }

  get body () { return this.response.body }
  set body (value: JsonValue | undefined) { this.response.body = value }

  get status () { return this.response.status }
  set status (val: HttpStatus) { this.response.status = val }

  get message () { return this.response.message }
  set message (val: string) { this.response.message = val }

  get type () { return this.response.type }
  set type (val: string) { this.response.type = val }

  get headers () { return this.request.headers }
  get headerSent () { return this.response.headerSent }

  /** Get special request header. */
  get <T extends string>(key: T) { return this.request.get(key) }
  /** Set special response header.\nTODO: implement object overload */
  set = (key: Koa.HeaderKey, value: Koa.HeaderValue): this => {
    this.response.set(key, value)
    return this
  }

  /** Append a value to special response header. */
  append = (key: Koa.HeaderKey, value: Koa.HeaderValue): this => {
    this.response.append(key, value)
    return this
  }

  /** Remove a special key. */
  remove = (key: Koa.HeaderKey): this => {
    this.response.remove(key)
    return this
  }

  redirect (action: 'back', referer?: string): void
  redirect (url: string): void
  redirect (url: 'back' | string, alt?: string): void {
    this.response.redirect(url as any, alt)
  }

  throw (): never
  throw (appError: AppError): never
  throw (status?: HttpStatus, message?: string, detail?: JsonValue): never
  throw (status?: HttpStatus, detail?: JsonValue): never
  throw (message?: string, detail?: JsonValue): never
  throw (detail?: JsonValue): never
  throw (...args: any[]): never {
    if (args.length === 0) throw new AppError()
    if (args[0] instanceof AppError) throw args[0]
    const { message, detail, status } = AppError.handleArguments(args)
    throw new AppError(status, message, detail)
  }

  assert (value: any): asserts value
  assert (value: any, appError: AppError): asserts value
  assert (value: any, status?: HttpStatus, message?: string, detail?: JsonValue): asserts value
  assert (value: any, status?: HttpStatus, detail?: JsonValue): asserts value
  assert (value: any, message?: string, detail?: JsonValue): asserts value
  assert (value: any, detail?: JsonValue): asserts value
  assert (value: any, ...args: any[]): asserts value {
    if (!value) this.throw(...args)
  }

  toJSON = (): JsonValue => {
    return {
      app: this.app.toJSON(),
      state: JSON.parse(JSON.stringify(this.state)),
      request: this.request.toJSON(),
      response: this.response.toJSON(),
    }
  }
}
