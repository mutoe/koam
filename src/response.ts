import http from 'node:http'
import { HttpStatus } from 'src/enums/http-status'

export default class Response {
  body: any

  #res: http.ServerResponse

  constructor (res: http.ServerResponse) {
    this.#res = res
  }

  get status (): HttpStatus { return this.#res.statusCode }
  set status (val: HttpStatus) { this.#res.statusCode = val }
}
