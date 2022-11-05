import { mockConsole } from 'test/utils/mock-console'
import Koa from '../src'

describe('# middleware', () => {
  let app: Koa
  let testAddress: any = {}
  const baseUrl = () => `http://localhost:${testAddress.port || 33_000}`
  const cb = jest.fn()

  beforeEach(() => { testAddress = 33_000; app = new Koa() })
  afterEach(() => app.close())

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
})
