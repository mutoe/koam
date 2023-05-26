import '@mutoe/koam'

import type Route from './route'
import Router from './router'

declare module '@mutoe/koam' {
  interface Context {
    params?: Record<string, string>
    router?: Router
    /** Only path matched routes */
    routes?: Route[]
  }
}

declare global {
  namespace Koa {
    export interface Middleware {
      router?: Router
    }
  }
}

export {}
