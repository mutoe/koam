import Koa from '../src'

describe('# middleware', () => {
  let app: Koa
  let testAddress: any = {}
  const baseUrl = () => `http://localhost:${testAddress.port || 33_000}`
  const cb = jest.fn()

  beforeEach(() => { testAddress = 33_000; app = new Koa() })
  afterEach(() => app.close())

  it('should can get request basic information', async () => {
    testAddress = app.use(cb).listen(0).address()

    const path = '/path'
    const query = '?foo=1&bar=true&baz=baz'
    await fetch(`${baseUrl()}${path}${query}`, { method: 'GET' })

    expect(cb).toHaveBeenCalledTimes(1)
    const ctx = cb.mock.calls[0][0]
    expect(ctx).toMatchObject({
      method: 'GET',
      url: path + query,
      path,
      query: { foo: 1, bar: true, baz: 'baz' },
    })
  })

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

    // TODO: need implement error handling first
    it.skip('should not support call next callback multiple times in same middleware', async () => {
      app.use(async (ctx, next) => { await next(); await next() })
      testAddress = app.listen(0)
        .on('error', cb)
        .address()

      await fetch(baseUrl())

      expect(cb).toHaveBeenCalledTimes(1)
    })
  })

  describe('parse request body', () => {
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
      expect(ctx.body).toEqual({ foo: 'bar', count: 1 })
    })
  })
})
