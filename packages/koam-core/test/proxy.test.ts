import type { Context } from '../src'
import Koa from '../src'

describe('# proxy server', () => {
  let app: InstanceType<typeof Koa>
  let testAddress: any = {}
  const baseUrl = () => `http://127.0.0.1:${testAddress.port || 33_000}`
  const cb = vi.fn()

  beforeEach(() => { testAddress = {}; app = new Koa() })
  afterEach(() => void app.close())

  it('should return forwarded host in request host getter', async () => {
    app = new Koa({ proxy: true })
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

  describe('vary', () => {
    it('should set vary header', async () => {
      testAddress = app.use(ctx => {
        ctx.vary('Origin')
        ctx.body = 'Hello'
      }).listen(0).address()

      const res = await fetch(baseUrl())
      expect(res.ok).toBe(true)
      expect(res.headers.get('vary')).toEqual('Origin')
    })

    it('should set vary header with multi fields', async () => {
      testAddress = app.use(ctx => {
        ctx.vary(['Origin', 'User-Agent'])
        ctx.status = 200
      }).listen(0).address()

      const res = await fetch(baseUrl())
      expect(res.ok).toBe(true)
      expect(res.headers.get('vary')).toEqual('Origin, User-Agent')
    })

    it('should preserve case', async () => {
      testAddress = app.use(ctx => {
        ctx.vary(['ORIGIN', 'user-agent', 'AccepT'])
        ctx.status = 200
      }).listen(0).address()

      const res = await fetch(baseUrl())
      expect(res.ok).toBe(true)
      expect(res.headers.get('vary')).toEqual('ORIGIN, user-agent, AccepT')
    })

    it('should not set Vary on empty array', () => {
      testAddress = app.use(ctx => {
        ctx.vary([])
        ctx.status = 200
      }).listen(0).address()

      return fetch(baseUrl()).then(res => {
        expect(res.ok).toBe(true)
        expect(res.headers.has('vary')).toBe(false)
      })
    })

    it('should append new field', async () => {
      testAddress = app.use(async (ctx, next) => {
        ctx.set('Vary', ['Accept', 'Origin'])
        await next()
      }).use(ctx => {
        ctx.vary('origin')
        ctx.vary('User-Agent')
        ctx.vary('user-agent')
        ctx.vary('Accept')
        ctx.status = 200
      }).listen(0).address()

      const res = await fetch(baseUrl())
      expect(res.ok).toBe(true)
      expect(res.headers.get('vary')).toEqual('Accept, Origin, User-Agent')
    })

    it('should set vary is "*"', () => {
      testAddress = app.use(ctx => {
        ctx.vary('Accept')
        ctx.vary('User-Agent, *')
        ctx.vary('Origin')
        ctx.status = 200
      }).listen(0).address()

      return fetch(baseUrl()).then(res => {
        expect(res.ok).toBe(true)
        expect(res.headers.get('vary')).toEqual('*')
      })
    })

    it('should accept long whitespace', () => {
      testAddress = app.use(ctx => {
        ctx.vary(' User-Agent,  Origin   ,   ')
        ctx.status = 200
      }).listen(0).address()

      return fetch(baseUrl()).then(res => {
        expect(res.ok).toBe(true)
        expect(res.headers.get('vary')).toEqual('User-Agent, Origin')
      })
    })

    it('should ignore duplicated fields', () => {
      testAddress = app.use(ctx => {
        ctx.vary('Origin')
        ctx.vary(['Origin', 'Origin', 'Origin'])
        ctx.status = 200
      }).listen(0).address()

      return fetch(baseUrl()).then(res => {
        expect(res.ok).toBe(true)
        expect(res.headers.get('vary')).toEqual('Origin')
      })
    })
  })
})
