import { Koa } from '../index'

export const fallbackResponse: Koa.MiddlewareGenerator = () => async (ctx, next) => {
  await next()
  ctx.res.end()
}
