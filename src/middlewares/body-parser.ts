import { Koa } from '../index'

/**
 * Koa body parser
 *
 * @description Currently only support json format request body
 *
 * TODO: support another request body
 */
export const bodyParser: Koa.MiddlewareGenerator = () => async (ctx, next) => {
  const chunks: Uint8Array[] = []
  await new Promise<void>(resolve => {
    ctx.req.on('data', chunk => chunks.push(chunk))
      .on('end', () => {
        if (chunks.length === 0) return
        try {
          ctx.request.body = JSON.parse(Buffer.concat(chunks).toString())
        } catch {
          // TODO; replace to ctx.log method
          console.info('parse request body failed')
        } finally {
          resolve()
        }
      })
  })
  await next()
}
