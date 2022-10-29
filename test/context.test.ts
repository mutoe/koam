import Koa from '../src'

describe('# context', () => {
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
