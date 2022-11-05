import { implementToObject } from 'test/utils/implement-to-object'
import { setUserToStateMiddleware } from 'test/utils/middlewares'
import { mockConsole } from 'test/utils/mock-console'
import Koa, { AppError, Context, HttpStatus } from '../src'

implementToObject()

describe('# context', () => {
  let app: Koa
  let testAddress: any = {}
  const baseUrl = (url: string = '') => `http://localhost:${testAddress.port || 33_000}${url}`
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
      const ctx = cb.mock.calls[0][0] as Context
      expect(ctx.type).toEqual('application/json')
    })
  })

  describe('redirect', () => {
    it('should set redirect header with referer and body when call context.redirect with back', async () => {
      const referer = 'example.com'
      testAddress = app.use(ctx => ctx.redirect('back'))
        .listen().address()

      const res = await fetch(baseUrl(), {
        redirect: 'manual',
        headers: { referer },
      })

      expect(res.status).toEqual(302)
      expect(res.headers.get('location')).toEqual(referer)
      await expect(res.text()).resolves.toEqual('Redirecting to example.com ...')
    })

    it('should set redirect header and body to referer when call context.redirect with back and url at the sametime', async () => {
      const referer = 'homepage.com'
      testAddress = app.use(ctx => ctx.redirect('back', 'another.com'))
        .listen().address()

      const res = await fetch(baseUrl(), {
        redirect: 'manual',
        headers: { referer },
      })

      expect(res.status).toEqual(302)
      expect(res.headers.get('location')).toEqual(referer)
    })

    it('should set redirect header and body to url when call context.redirect with back and url at the sametime', async () => {
      const referer = 'homepage.com'
      testAddress = app.use(ctx => ctx.redirect('back', referer))
        .listen().address()

      const res = await fetch(baseUrl(), { redirect: 'manual' })

      expect(res.status).toEqual(302)
      expect(res.headers.get('location')).toEqual(referer)
    })

    it('should set redirect header and body to url when call context.redirect url', async () => {
      const referer = 'homepage.com'
      testAddress = app.use(ctx => ctx.redirect(referer))
        .listen().address()

      const res = await fetch(baseUrl(), { redirect: 'manual' })

      expect(res.status).toEqual(302)
      expect(res.headers.get('location')).toEqual(referer)
    })
  })

  describe('throw', () => {
    it('should not call next middleware and following actions in previous middlewares', async () => {
      testAddress = app
        .use(async (ctx, next) => { cb(1); await next(); cb(2) })
        .use(async (ctx, next) => { ctx.throw(); cb(3); await next(); cb(4) })
        .use(() => { cb(5) })
        .listen(0).address()

      await mockConsole(async () => {
        await fetch(baseUrl())
      })

      expect(cb).toHaveBeenCalledTimes(1)
      expect(cb).toHaveBeenNthCalledWith(1, 1)
    })

    it('should get ServerInternalError response when error thrown in middleware', async () => {
      testAddress = app.use(ctx => ctx.throw())
        .listen(0).address()

      await mockConsole(async () => {
        const res = await fetch(baseUrl())

        expect(res.status).toEqual(500)
        expect(res.statusText).toEqual('Internal Server Error')
      })
    })

    it('should get BadRequest response when error thrown in middleware', async () => {
      testAddress = app.use(ctx => ctx.throw(HttpStatus.BadRequest, 'Form error', { username: 'exist' }))
        .listen(0).address()

      await mockConsole(async () => {
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

      await mockConsole(async () => {
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
        // `ctx.assert` must explicit declare Context type. See https://github.com/microsoft/TypeScript/issues/34523
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

      await mockConsole(async () => {
        const res = await fetch(baseUrl())

        expect(res.status).toEqual(400)
        expect(res.statusText).toEqual('User not exist')
      })

      expect(cb.mock.calls.map(it => it[0])).toEqual([1, '1.23', 4])
    })
  })

  describe('toJSON', () => {
    it('should return useful information', async () => {
      testAddress = app
        .use(async (ctx, next) => {
          ctx.body = { foo: 'bar' }
          await next()
          cb(ctx.toJSON())
        })
        .listen(0).address()

      await fetch(baseUrl('/foo?bar=1'), {
        method: 'post',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ hello: 'world' }),
      })

      expect(cb.mock.calls[0][0]).toEqual({
        app: {
          env: 'test',
          silent: false,
          proxy: false,
        },
        state: {
          requestDateTime: expect.any(String),
        },
        request: {
          ip: '::1',
          method: 'POST',
          url: '/foo?bar=1',
          headers: {
            'accept': '*/*',
            'accept-encoding': 'gzip, deflate',
            'accept-language': '*',
            'connection': 'keep-alive',
            'content-length': '17',
            'content-type': 'application/json',
            'host': `localhost:${testAddress.port}`,
            'sec-fetch-mode': 'cors',
            'user-agent': expect.any(String),
          },
          body: {
            hello: 'world',
          },
        },
        response: {
          status: 200,
          message: undefined,
          headers: {
            'content-type': 'application/json; charset=utf-8',
          },
          body: {
            foo: 'bar',
          },
        },
      })
    })
  })
})
