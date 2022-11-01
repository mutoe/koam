import http from 'node:http'
import Application from 'src/application'
import { Context } from 'src/context'
import { HttpStatus } from 'src/enums/http-status'

export default class Response {
  readonly app: Application
  readonly context: Context
  body: any

  #res: http.ServerResponse

  constructor (app: Application, res: http.ServerResponse) {
    this.app = app
    this.context = app.context
    this.#res = res
  }

  get status (): HttpStatus { return this.#res.statusCode }
  set status (val: HttpStatus) { this.#res.statusCode = val }
}
