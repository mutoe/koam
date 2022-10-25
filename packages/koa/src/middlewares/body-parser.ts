import { Koa } from '../index'

/**
 * Koa body parser
 *
 * @description Currently only support json format request body
 *
 * TODO: support another request body
 */
export const bodyParser: Koa.MiddlewareGenerator = () => async (ctx, next) => {
  let chunks: string = ''
  ctx.req.on('data', chunk => (chunks += chunk))
    .on('end', () => {
      ctx.request.bodyChunks = chunks
      try {
        ctx.request.jsonBody = JSON.parse(Buffer.from(chunks).toString())
      } catch {}
    })
  await next()
}
