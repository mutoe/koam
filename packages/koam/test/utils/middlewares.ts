import Koa from '../../src'

declare global {
  interface KoaState {
    /** Test override state */
    userId?: string
  }
}

export const setUserToStateMiddleware: Koa.MiddlewareGenerator = (userId: string) => (ctx, next) => {
  ctx.state.userId = userId
  return next()
}
