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

  type ErrorHandler = (error: Error, context: Context) => void | Promise<void>

  interface Config {
    /**
     * @description You can log, send request, write file, trigger event and do anything you want.
     */
    onError: Koa.ErrorHandler

    /**
     * @description Whether print the logs.
     * @default false
     */
    silent: boolean

    /**
     * @description Whether there is a proxy such as nginx before application
     * @default false
     */
    proxy: boolean

    /**
     * @description If you have proxy, specify the header of the forwarding IPs.
     * @default x-forwarded-for
     */
    proxyIpHeader: string

    /**
     * @description If you have proxy, specify how many proxy server you have.
     * @default 0 (unlimited)
     */
    maxIpsCount: number
  }

  type HeaderKey = keyof http.IncomingHttpHeaders | string
  type HeaderValue = http.OutgoingHttpHeader

  type Middleware = (ctx: Context, next: () => Promise<void>) => Promise<void> | void
  type MiddlewareGenerator = (...args: any[]) => Middleware
}

export { Koa }
