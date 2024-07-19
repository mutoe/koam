import { Buffer } from 'node:buffer'
import { HttpMethod } from '../enums'

/**
 * Koa body parser
 *
 * @description Currently only support json format request body
 */
export const bodyParser: Koa.MiddlewareGenerator = () => async (ctx, next) => {
  if ([HttpMethod.GET, HttpMethod.HEAD].includes(ctx.request.method))
    return await next()

  if (!['application/json', 'text/plain'].includes(ctx.request.type ?? ''))
    return await next()

  await new Promise<void>(resolve => {
    const chunks: Uint8Array[] = []
    ctx.req.on('readable', () => {
      let chunk: Uint8Array
      while ((chunk = ctx.req.read()) !== null)
        chunks.push(chunk)
    })
    ctx.req.on('end', () => {
      if (chunks.length === 0)
        return resolve()
      try {
        ctx.request.body = JSON.parse(Buffer.concat(chunks).toString())
      }
      catch {
        // eslint-disable-next-line no-console
        console.debug('parse request body failed')
      }
      finally {
        resolve()
      }
    })
  })

  await next()
}
