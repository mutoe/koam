import Koa from '../index'

/**
 * Koa body parser
 *
 * @description Currently only support json format request body
 *
 * TODO: support another request body
 */
export const bodyParser: Koa.MiddlewareGenerator = () => async (ctx, next) => {
  await new Promise<void>(resolve => {
    const chunks: Uint8Array[] = []
    ctx.req.on('readable', () => {
      let chunk: Uint8Array
      while ((chunk = ctx.req.read()) !== null) chunks.push(chunk)
    })
    ctx.req.on('end', () => {
      if (chunks.length === 0) return resolve()
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
