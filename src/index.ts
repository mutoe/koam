import http from 'node:http'
import { Context } from 'src/context'
import { HttpStatus } from 'src/enums/http-status'

declare global {
  /** Append properties to this interface */
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface KoaState {}
}

declare namespace Koa {
  type State = KoaState

  interface Config {
    proxy: boolean
    proxyIpHeader: string
    maxIpsCount: number
    /** @deprecated Non-standard API */
    onError: (error: Error) => void
  }

  interface Response {
    status: HttpStatus
    body: any
  }

  type HeaderKey = keyof http.IncomingHttpHeaders | string
  type HeaderValue = http.OutgoingHttpHeader

  type JsonValue =
    | string | number | boolean
    | { [x: string]: JsonValue }
    | JsonValue[]

  type Middleware = (ctx: Context, next: () => Promise<void>) => Promise<void> | void
  type MiddlewareGenerator = (...args: any[]) => Middleware
}

export { Koa }
export { default } from './application'
