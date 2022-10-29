import { HttpStatus } from 'src/enums/http-status'
import { Context } from './context'

declare namespace Koa {
  export interface Config {
    /** @deprecated Non-standard API */
    onError: (error: Error) => void
  }

  export interface Request {
    method?: string
    url?: string
    path?: string
    query?: any
    /** @deprecated Non-standard API */
    bodyChunks?: string
    body?: any
  }

  export interface Response {
    status: HttpStatus
    body: any
  }

  export type JsonValue =
      | string | number | boolean
      | { [x: string]: JsonValue }
      | JsonValue[]

  export type Middleware = (ctx: Context, next: () => Promise<void>) => Promise<void> | void
  export type MiddlewareGenerator = (...args: any[]) => Middleware

}

export { Koa }
export { default } from './application'
