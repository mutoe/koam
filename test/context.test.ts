import { Context } from 'src/context'
import { HttpStatus } from 'src/enums/http-status'
import { implementToObject } from 'test/utils/implement-to-object'
import { setUserToStateMiddleware } from 'test/utils/middlewares'
import { mockConsoleError } from 'test/utils/mock-console'
import Koa, { AppError } from '../src'

implementToObject()

describe('# context', () => {
  let app: Koa
  let testAddress: any = {}
  const baseUrl = () => `http://localhost:${testAddress.port || 33_000}`
  const cb = jest.fn()

  beforeEach(() => { testAddress = 33_000; app = new Koa() })
  afterEach(() => app.close())

  describe('context properties', () => {
    it('should equal between app and context.app', async () => {
      testAddress = app.use(cb).listen(0).address()

      await fetch(baseUrl())

      const ctx = cb.mock.calls[0][0]
      expect(ctx.app).toBe(app)
    })

    it('should can be expanded when add properties to state', async () => {
      testAddress = app
        .use(setUserToStateMiddleware('abc'))
        .use(cb)
        .listen(0).address()

      await fetch(baseUrl())

      const ctx = cb.mock.calls[0][0] as Context
      expect(ctx.state.userId).toEqual('abc')
    })
  })

  describe('request', () => {
    it('should can get request url basic information', async () => {
      testAddress = app.use(cb).listen(0).address()

      const protocol = 'http'
      const host = `localhost:${testAddress.port}`
      // const origin = `${protocol}://${host}`
      const path = '/path'
      const querystring = 'foo=1&bar=true&baz=baz'
      const url = `${path}?${querystring}`
      // const href = `${origin}${url}`

      await fetch(`${baseUrl()}${url}`, { method: 'GET' })

      expect(cb).toHaveBeenCalledTimes(1)

      const ctx = cb.mock.calls[0][0].toObject()
      const expectedContextProperties = {
        method: 'GET',
        protocol,
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
        body: JSON.stringify({ foo: '你好, Nodejs!', count: 1 }),
      })

      expect(cb).toHaveBeenCalledTimes(1)
      const ctx = cb.mock.calls[0][0]
      expect(ctx.method).toBe('POST')
      expect(ctx.request.body).toEqual({ foo: '你好, Nodejs!', count: 1 })
    })
  })

  describe('request headers', () => {
    it('should return request headers correctly', async () => {
      testAddress = app.use(cb).listen(0).address()
      const headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'X-Request-Id': 'abc',
      }

      await fetch(baseUrl(), {
        method: 'post',
        headers,
        body: JSON.stringify({ foo: 'bar' }),
      })

      expect(cb).toHaveBeenCalledTimes(1)
      const ctx = cb.mock.calls[0][0]
      expect(ctx.headers).toBe(ctx.request.headers)
      expect(ctx.headers).toMatchObject({
        'content-type': 'application/json; charset=utf-8',
        'x-request-id': 'abc',
      })
      expect(ctx.get('x-request-id')).toEqual('abc')
      expect(ctx.request.get('content-type')).toEqual(headers['Content-Type'])
      expect(ctx.request).toHaveLength(13)
      expect(ctx.request.type).toBe('application/json')
      expect(ctx.request.charset).toBe('utf-8')
    })

    it('should return correct client ip address correctly', async () => {
      testAddress = app.use(cb).listen(0).address()
      await fetch(baseUrl())

      const ctx = cb.mock.calls[0][0]
      expect(ctx.request.socket).toBe(ctx.socket)
      // TODO: get ip address from proxy header
      expect(ctx.request.socket.remoteAddress).toBe('::1')
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

  describe('response headers', () => {
    it('should can get/set/append/remove response header', async () => {
      testAddress = app
        .use(async (ctx, next) => { ctx.set('x-request-id', '1'); await next() })
        .use(async (ctx, next) => { ctx.append('x-request-id', '2'); await next() })
        .use(async (ctx, next) => { ctx.append('trace-id', '1'); await next() })
        .use(async (ctx, next) => { cb(ctx.response.get('trace-id')); await next() })
        .use(async (ctx, next) => { ctx.remove('trace-id'); await next() })
        .use(async (ctx, next) => { cb(ctx.response.get('trace-id')); await next() })
        .listen(0).address()

      const response = await fetch(baseUrl())

      const headers = Object.fromEntries(response.headers as any)
      expect(headers).toMatchObject({ 'x-request-id': '1, 2' })
      expect(headers).not.toHaveProperty('trace-id')
      expect(cb).toHaveBeenNthCalledWith(1, '1')
      expect(cb).toHaveBeenNthCalledWith(2, undefined)
    })

    it('should can get status message correctly', async () => {
      testAddress = app
        .use((ctx, next) => { ctx.message = 'hello'; return next() })
        .use(cb)
        .listen(0).address()

      const response = await fetch(baseUrl())

      expect(response.statusText).toEqual('hello')
      const ctx = cb.mock.calls[0][0]
      expect(ctx.message).toEqual('hello')
    })

    it('should can set and get response content correctly', async () => {
      testAddress = app
        .use((ctx, next) => { ctx.type = 'application/json'; return next() })
        .use(cb)
        .listen(0).address()

      const response = await fetch(baseUrl())

      expect(response.headers.get('content-type')).toEqual('application/json; charset=utf-8')
      const ctx = cb.mock.calls[0][0]
      expect(ctx.type).toEqual('application/json; charset=utf-8')
    })
  })

  describe('throw', () => {
    it('should not call next middleware and following actions in previous middlewares', async () => {
      testAddress = app
        .use(async (ctx, next) => { cb(1); await next(); cb(2) })
        .use(async (ctx, next) => { ctx.throw(); cb(3); await next(); cb(4) })
        .use(() => { cb(5) })
        .listen(0).address()

      await mockConsoleError(async () => {
        await fetch(baseUrl())
      })

      expect(cb).toHaveBeenCalledTimes(1)
      expect(cb).toHaveBeenNthCalledWith(1, 1)
    })

    it('should get ServerInternalError response when error thrown in middleware', async () => {
      testAddress = app.use(ctx => ctx.throw())
        .listen(0).address()

      await mockConsoleError(async (consoleError) => {
        const res = await fetch(baseUrl())

        expect(res.status).toEqual(500)
        expect(consoleError).toHaveBeenCalledTimes(1)
        const error = consoleError.mock.calls[0][0] as AppError
        expect(error.message).toEqual('Internal Server Error')
        expect(error.name).toEqual('Error')
        expect(error.expose).toBe(false)
      })
    })

    it('should get BadRequest response when error thrown in middleware', async () => {
      testAddress = app.use(ctx => ctx.throw(HttpStatus.BadRequest, 'Form error', { username: 'exist' }))
        .listen(0).address()

      await mockConsoleError(async () => {
        const res = await fetch(baseUrl())

        expect(res.status).toEqual(400)
        expect(res.statusText).toEqual('Form error')
        await expect(res.json()).resolves.toEqual({ username: 'exist' })
      })
    })

    it('should get custom error response when AppError thrown in middleware', async () => {
      const unauthorizedError = new AppError(401, { token: 'expired' })
      testAddress = app.use(ctx => ctx.throw(unauthorizedError))
        .listen(0).address()

      await mockConsoleError(async () => {
        const res = await fetch(baseUrl())

        expect(res.status).toEqual(401)
        expect(res.statusText).toEqual('Unauthorized')
        await expect(res.json()).resolves.toEqual({ token: 'expired' })
      })
    })
  })

  describe('assert', () => {
    it('should not call next middleware and following actions in previous middlewares', async () => {
      testAddress = app
        .use(async (ctx, next) => { cb(1); await next(); cb(2) })
        .use(async (ctx: Context, next) => {
          const val: unknown = 1.2345
          ctx.assert(typeof val === 'number', 500)
          cb(val.toFixed(2))
          await next()
          cb(3)
        })
        .use((ctx: Context) => {
          cb(4)
          ctx.assert(ctx.state.userId, 400, 'User not exist')
          cb(ctx.state.userId.padStart(20))
        })
        .listen(0).address()

      await mockConsoleError(async () => {
        const res = await fetch(baseUrl())

        expect(res.status).toEqual(400)
        expect(res.statusText).toEqual('User not exist')
      })

      expect(cb.mock.calls.map(it => it[0])).toEqual([1, '1.23', 4])
    })
  })
})
