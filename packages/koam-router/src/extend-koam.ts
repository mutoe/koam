import '@mutoe/koam-core'

import type Route from './route'
import type Router from './router'

declare module '@mutoe/koam-core' {
  interface Context {
    /** Alias for context.request.params */
    params?: Record<string, string>
    /** captured named route names */
    captures?: string[]
    router?: Router
    /** Only path matched routes */
    routes?: Route[]
    pathMatchedRoutes?: Route[]
  }

  interface Request {
    params?: Record<string, string>
  }
}

declare global {
  namespace Koa {
    export interface Middleware {
      router?: Router
      param?: string
    }
  }
}

export {}
