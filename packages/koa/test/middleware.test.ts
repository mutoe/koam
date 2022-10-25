import { Koa } from '../src'

const TEST_PORT = 33_000

describe('# middleware', () => {
  let app: Koa

  beforeEach(() => {
    app = new Koa()
  })

  afterEach(() => {
    app.close()
  })

  it('should implement onion model (order for executing middleware)', async () => {
    const verify = jest.fn()
    for (const i of [1, 2, 3]) {
      app.use(async (ctx, next) => {
        verify(2 * i - 1)
        await next()
        verify(2 * i)
      })
    }
    app.listen(TEST_PORT)

    await fetch(`http://localhost:${TEST_PORT}/path?foo=1&bar=true#hash`, { method: 'GET' })

    expect(verify.mock.calls.map(it => it[0])).toEqual([1, 3, 5, 6, 4, 2])
  })

  it('should can get request basic information', async () => {
    const verify = jest.fn()
    app.use(verify).listen(33_000)

    const path = '/path'
    const query = '?foo=1&bar=true&baz=baz'
    await fetch(`http://localhost:${TEST_PORT}${path}${query}`, { method: 'GET' })

    const ctx = verify.mock.calls[0][0]
    expect(ctx.method).toEqual('GET')
    expect(ctx.url).toEqual(path + query)
    expect(ctx.path).toEqual('/path')
    expect(ctx.query).toEqual({ foo: 1, bar: true, baz: 'baz' })
  })
})
