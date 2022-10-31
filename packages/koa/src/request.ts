import http from 'node:http'
import { parseQuery } from 'src/utils/query-string'

export default class Request {
  path: string
  /** @deprecated Non-standard API */
  bodyChunks?: string
  body?: any

  #req: http.IncomingMessage
  #querystring: string = ''

  constructor (req: http.IncomingMessage) {
    this.#req = req
    const [path, queryString] = req.url?.split('?') ?? []
    this.path = path
    this.querystring = queryString
  }

  /** TODO: change return value to special type (uppercase string literal) */
  get method (): string { return this.#req.method || '' }
  /** TODO: change value to special type (uppercase string literal) */
  set method (val: string) { this.#req.method = val }

  get url (): string { return this.#req.url || '' }
  // TODO: set url (val: string) { this.#req.url = val }

  get protocol (): string {
    // TODO: (proxy) get protocol from 'X-Forwarded-Proto'
    return (this.#req.socket as any).encrypted ? 'https' : 'http'
  }

  get host (): string {
    // TODO: (proxy) get protocol from 'X-Forwarded-Host'
    return this.#req.headers.host || ''
  }

  /** Get search string. */
  get querystring (): string { return this.#querystring }
  set querystring (val: string | undefined) { this.#querystring = val?.replace(/^\?/, '') ?? '' }

  /** Get search string. TODO: Same as `request.querystring` but prefix with `?` */
  get search (): string { return this.querystring }
  set search (val: string) { this.querystring = val }

  get query (): any { return parseQuery(this.#querystring) }

  get headers (): http.IncomingHttpHeaders { return this.#req.headers }
}
