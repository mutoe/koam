/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import http from 'node:http'
import { HttpMethod } from 'src/enums/http-method'
import { HttpStatus } from 'src/enums/http-status'
import Request from './request'
import Response from './response'
import Application, { Koa } from './index'

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

  constructor (app: Application, req: http.IncomingMessage, res: http.ServerResponse) {
    this.req = req
    this.res = res
    this.request = new Request(app, req)
    this.response = new Response(app, res)
    this.onError = app.config.onError
  }

  get socket () { return this.request.socket }
  get ip () { return this.request.ip }
  get ips () { return this.request.ips }

  get method () { return this.request.method }
  set method (val: HttpMethod) { this.request.method = val }

  get host () { return this.request.host }
  get protocol () { return this.request.protocol }
  get url () { return this.request.url ?? '' }
  get path () { return this.request.path ?? '' }
  get query () { return this.request.query }
  get querystring () { return this.request.querystring }

  get body () { return this.response.body }
  set body (value: Koa.JsonValue) { this.response.body = value }

  get status () { return this.response.status }
  set status (val: HttpStatus) { this.response.status = val }

  get headers () { return this.request.headers }

  /** Get special request header. */
  get <T extends string>(key: T) { return this.request.get(key) }
}
