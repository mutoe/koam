import type { IncomingMessage, ServerResponse } from 'node:http'
import { Context } from '../index'
import { noop } from '../utils'

export type ConnectMiddleware = (req: IncomingMessage, res: ServerResponse, next: (err?: unknown) => void | Promise<void>) => void

function noCallbackHandler (ctx: Context, connectMiddleware: ConnectMiddleware, next: () => Promise<void>) {
  connectMiddleware(ctx.req, ctx.res, noop)
  return next()
}

function callbackHandler (ctx: Context, connectMiddleware: ConnectMiddleware, next: () => Promise<void>) {
  return new Promise((resolve, reject) => {
    connectMiddleware(ctx.req, ctx.res, (error) => {
      if (error) return reject(error)
      resolve(next())
    })
  })
}

export function connect (connectMiddleware: ConnectMiddleware): Koa.Middleware {
  const handler = connectMiddleware.length < 3 ? noCallbackHandler : callbackHandler
  return async (ctx, next) => {
    await handler(ctx, connectMiddleware, next)
  }
}
