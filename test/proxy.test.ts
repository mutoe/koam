import { implementToObject } from 'test/utils/implement-to-object'
import Koa, { Context } from '../src'

implementToObject()

describe('# proxy server is available', () => {
  let app: Koa
  let testAddress: any = {}
  const baseUrl = () => `http://127.0.0.1:${testAddress.port || 33_000}`
  const cb = jest.fn()

  beforeEach(() => { testAddress = 33_000; app = new Koa({ proxy: true }) })
  afterEach(() => app.close())

  it('should return forwarded host in request host getter', async () => {
    const proxyHeaders = {
      'x-forwarded-for': '1.2.3.4, 100.200.300.400',
      'x-forwarded-host': 'example.cdn.com',
      'x-forwarded-proto': 'https',
    }
    testAddress = app.use(cb).listen(0).address()

    await fetch(baseUrl(), { headers: proxyHeaders })

    const ctx = cb.mock.calls[0][0] as Context
    expect(ctx.request.host).toEqual('example.cdn.com')
    expect(ctx.request.protocol).toEqual('https')
    expect(ctx.request.ips).toEqual(['1.2.3.4', '100.200.300.400'])
    expect(ctx.request.ip).toEqual('1.2.3.4')
  })
})
