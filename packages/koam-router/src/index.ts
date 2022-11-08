import Koa from '@mutoe/koam'

export default class Router {
  constructor () {
    console.log('new Router')
  }

  routes (): Koa.Middleware {
    return async (ctx, next) => {
      console.log(1)
      await next()
    }
  }
}
