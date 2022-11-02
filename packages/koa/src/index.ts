import http from 'node:http'
import Context from 'src/context'

export * from './enums'
export * from './middlewares'
export * from './utils'
export { default as AppError } from './app-error'
export { default as Context } from './context'
export { default as Request } from './request'
export { default as Response } from './response'
export { default } from './application'

declare global {
  /** Append properties to this interface */
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface KoaState {}

  type JsonValue =
    | string | number | boolean
    | { [x: string]: JsonValue }
    | JsonValue[]
    | null
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

  type HeaderKey = keyof http.IncomingHttpHeaders | string
  type HeaderValue = http.OutgoingHttpHeader

  type Middleware = (ctx: Context, next: () => Promise<void>) => Promise<void> | void
  type MiddlewareGenerator = (...args: any[]) => Middleware
}

export { Koa }
