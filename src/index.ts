import { Context } from './context'

declare namespace Koa {
  export interface Config {
    onError: (error: Error) => void
  }

  export interface Request {
    method?: string
    url?: string
    path?: string
    query?: any
    bodyChunks?: string
    jsonBody?: any
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
