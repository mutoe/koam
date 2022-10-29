import { HttpStatus } from 'src/enums/http-status'
import Koa from '../src'

describe('# context', () => {
  let app: Koa
  let testAddress: any = {}
  const baseUrl = () => `http://localhost:${testAddress.port || 33_000}`
  const cb = jest.fn()

  beforeEach(() => { testAddress = 33_000; app = new Koa() })
  afterEach(() => app.close())

  describe('request', () => {
    it('should can get request url basic information', async () => {
      testAddress = app.use(cb).listen(0).address()

      // const protocol = 'http'
      const host = `localhost:${testAddress.port}`
      // const origin = `${protocol}://${host}`
      const path = '/path'
      const querystring = 'foo=1&bar=true&baz=baz'
      const url = `${path}?${querystring}`
      // const href = `${origin}${url}`

      await fetch(`${baseUrl()}${url}`, { method: 'GET' })

      expect(cb).toHaveBeenCalledTimes(1)
      const ctx = cb.mock.calls[0][0]
      const expectedContextProperties = {
        method: 'GET',
        host,
        url,
        path,
        query: { foo: 1, bar: true, baz: 'baz' },
        querystring,
      }
      expect(ctx).toMatchObject(expectedContextProperties)
      expect(ctx.request).toMatchObject({
        ...expectedContextProperties,
        search: querystring,
      })
    })

    it('should parse json response correctly', async () => {
      testAddress = app.use(cb).listen(0).address()

      await fetch(baseUrl(), {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ foo: 'bar', count: 1 }),
      })

      expect(cb).toHaveBeenCalledTimes(1)
      const ctx = cb.mock.calls[0][0]
      expect(ctx.method).toBe('POST')
      expect(ctx.request.body).toEqual({ foo: 'bar', count: 1 })
    })
  })

  describe('response', () => {
    it('should can set response status', async () => {
      testAddress = app
        .use(async (ctx, next) => { ctx.status = HttpStatus.Unauthorized; await next() })
        .use(ctx => cb(ctx.status))
        .listen(0).address()

      const response = await fetch(baseUrl())

      expect(cb).toHaveBeenCalledWith(HttpStatus.Unauthorized)
      expect(response.status).toBe(HttpStatus.Unauthorized)
    })

    it('should set correct json response when call body setter', async () => {
      testAddress = app
        .use(async (ctx, next) => { ctx.body = { foo: 'bar' }; await next() })
        .use(ctx => { cb(ctx.body) })
        .listen(0).address()

      const response = await fetch(baseUrl())

      expect(cb).toHaveBeenCalledWith({ foo: 'bar' })
      expect(await response.json()).toEqual({ foo: 'bar' })
    })
  })
})
