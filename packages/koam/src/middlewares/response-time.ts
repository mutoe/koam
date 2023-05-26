import Koa from '../index'

declare global {
  namespace Koa {
    interface State {
      /**
       * The time when the program received the client request.
       * @format ISO-8601
       */
      requestDateTime?: string

      /**
       * Determine add `X-Response-Time` in response header
       */
      addResponseTimeHeader?: boolean

      /**
       * Indicates how long the program takes to process the request.
       * @format milliseconds
       */
      respondTime?: number
    }
  }
}

export const responseTime: Koa.MiddlewareGenerator = () => async (ctx, next) => {
  const [inSecond, inNano] = process.hrtime()
  ctx.state.requestDateTime ??= new Date().toISOString()
  try {
    await next()
  } finally {
    const [outSecond, outNano] = process.hrtime()
    const ms = (outSecond * 1e3 + outNano / 1e6) - (inSecond * 1e3 + inNano / 1e6)
    ctx.state.respondTime ??= Number.parseFloat(ms.toFixed(3))
    if (ctx.state.addResponseTimeHeader ?? !ctx.app.isProduction) {
      ctx.set('X-Response-Time', `${ms.toFixed(0)}ms`)
    }
  }
}
