import { mockConsole } from '../../../test-utils/mock-console'
import type { ConnectMiddleware, Context } from '../src'
import Koa, { HttpStatus, connect } from '../src'

describe('# middleware', () => {
  let app: InstanceType<typeof Koa>
  let testAddress: any = {}
  const baseUrl = () => `http://localhost:${testAddress.port || 33_000}`
  const cb = vi.fn()

  beforeEach(() => { testAddress = {}; app = new Koa() })
  afterEach(() => void app.close())

  describe('onion model', () => {
    it('should executing middleware in the correct order', async () => {
      app.use(async (ctx, next) => { cb(1); await next(); cb(2) })
        .use(async (ctx, next) => { cb(3); await next() })
        .use(async (ctx, next) => { await next(); cb(4) })
        .use(async (ctx, next) => { cb(5); await next(); cb(6) })
        .use(async () => { cb(7) })
        .use(async () => { cb(8) })
      testAddress = app.listen(0).address()

      await fetch(baseUrl())

      expect(cb.mock.calls.map(it => it[0])).toEqual([1, 3, 5, 7, 6, 4, 2])
    })

    it('should not support call next callback multiple times in same middleware', async () => {
      await mockConsole(async ({ consoleError }) => {
        app.use(async (ctx, next) => { await next(); await next() })
        testAddress = app.listen(0).address()

        await fetch(baseUrl())

        expect(consoleError).toHaveBeenCalledWith(new Error('next() called more than one time in the same middleware function'))
      })
    })
  })

  describe('body parser', () => {
    it('should set to request body when receive body', async () => {
      testAddress = app.use(ctx => cb(ctx.request.body))
        .listen().address()

      await fetch(baseUrl(), {
        method: 'PATCH',
        body: JSON.stringify({ foo: 'bar' }),
      })

      expect(cb).toHaveBeenCalledWith({ foo: 'bar' })
    })
  })

  describe('response time', () => {
    it('should set request date time in state', async () => {
      testAddress = app.use(cb).listen().address()

      await fetch(baseUrl())

      const ctx = cb.mock.calls[0][0] as Context
      expect(/^\d{4}-\d{2}-\d{2}/.test(ctx.state.requestDateTime!)).toBeTruthy()
    })

    it('should set response time header when set the config in state', async () => {
      testAddress = app.use(ctx => { ctx.state.addResponseTimeHeader = true })
        .listen().address()

      const res = await fetch(baseUrl())

      expect(/^\d+ms/.test(res.headers.get('x-response-time')!)).toBe(true)
    })

    it('should not set response time header when set the config in state', async () => {
      testAddress = app.use(ctx => { ctx.state.addResponseTimeHeader = false })
        .listen().address()

      const res = await fetch(baseUrl())

      expect(res.headers.has('x-response-time')).toBe(false)
    })

    it('should set response time header when env is not production', async () => {
      expect(app.env).not.toEqual('production')
      testAddress = app.listen().address()

      const res = await fetch(baseUrl())

      expect(/^\d+ms/.test(res.headers.get('x-response-time')!)).toBe(true)
    })

    it('should not set response time header when env is production', async () => {
      app.env = 'production'
      testAddress = app.listen().address()

      const res = await fetch(baseUrl())

      expect(res.headers.has('x-response-time')).toBe(false)
    })
  })

  describe('connect', () => {
    const cb = vi.fn()

    it('should convert no callback express middleware to koa middleware', async () => {
      const expressMiddleware: ConnectMiddleware = (req, res) => {
        cb(req.method)
        res.statusCode = HttpStatus.Unauthorized
      }
      testAddress = app.use(connect(expressMiddleware)).listen().address()

      const response = await fetch(baseUrl())

      expect(response.status).toEqual(HttpStatus.Unauthorized)
      expect(cb).toBeCalledWith('GET')
    })

    it('should convert callback express middleware to koa middleware', async () => {
      const expressMiddleware: ConnectMiddleware = (req, res, next) => {
        cb(req.method)
        res.statusCode = HttpStatus.Unauthorized
        next()
      }
      testAddress = app
        .use(connect(expressMiddleware))
        .use(ctx => { cb(ctx.status) })
        .listen().address()

      const response = await fetch(baseUrl())

      expect(response.status).toEqual(HttpStatus.Unauthorized)
      expect(cb).toHaveBeenNthCalledWith(1, 'GET')
      expect(cb).toHaveBeenNthCalledWith(2, HttpStatus.Unauthorized)
    })

    it('should convert callback express middleware to koa middleware with error', async () => {
      const onError = vi.fn()
      app = new Koa({ onError })
      const error = new Error('some error')
      const expressMiddleware: ConnectMiddleware = (req, res, next) => {
        res.statusCode = HttpStatus.InternalServerError
        next(error)
      }
      testAddress = app
        .use(connect(expressMiddleware))
        .use(() => { cb() })
        .listen().address()

      const response = await fetch(baseUrl())

      expect(response.status).toEqual(HttpStatus.InternalServerError)
      expect(onError).toBeCalledWith(error, expect.any(Object))
      expect(onError.mock.calls[0][1].response.message).toEqual('some error')
      expect(cb).not.toBeCalled()
    })
  })
})
