import Koa, { HttpStatus } from '@mutoe/koam'
import { beforeEach } from 'vitest'
import Router from '../src'

describe('Path match', () => {
  let app = new Koa()
  let router = new Router()
  let testAddress: any = {}
  const baseUrl = (path: string = '') => `http://localhost:${testAddress.port || 33_000}${path}`

  beforeEach(() => { testAddress = {}; app = new Koa(); router = new Router() })
  afterEach(() => void app.close())

  describe('url and method is matched', () => {
    it('given method is GET', async () => {
      router.get('/hello', ctx => { ctx.body = 'world!' })
      testAddress = app.use(router.routes())
        .listen(0).address()
      const result = await fetch(baseUrl('/hello'))

      expect(result.ok).toEqual(true)
      expect(result.status).toEqual(200)
      await expect(result.text()).resolves.toEqual('world!')
    })

    it('given method is POST', async () => {
      const cb = vi.fn()
      router.post('/hello', ctx => { cb(ctx.request.body); ctx.body = 'world!' })
      testAddress = app.use(router.routes())
        .listen(0).address()

      const result = await fetch(baseUrl('/hello'), { method: 'POST', body: JSON.stringify({ foo: 'bar' }) })

      expect(result.ok).toEqual(true)
      expect(result.status).toEqual(200)
      await expect(result.text()).resolves.toEqual('world!')
      expect(cb).toBeCalledWith({ foo: 'bar' })
    })

    it('given method is PATCH', async () => {
      const cb = vi.fn()
      router.patch('/hello', ctx => { cb(ctx.request.body); ctx.body = 'world!' })
      testAddress = app.use(router.routes())
        .listen(0).address()

      const result = await fetch(baseUrl('/hello'), { method: 'PATCH', body: JSON.stringify({ foo: 'bar' }) })

      expect(result.ok).toEqual(true)
      expect(result.status).toEqual(200)
      await expect(result.text()).resolves.toEqual('world!')
      expect(cb).toBeCalledWith({ foo: 'bar' })
    })

    it('given method is DELETE', async () => {
      const cb = vi.fn()
      router.delete('/hello', ctx => { cb(ctx.request.body); ctx.body = 'world!' })
      testAddress = app.use(router.routes())
        .listen(0).address()

      const result = await fetch(baseUrl('/hello'), { method: 'DELETE', body: JSON.stringify({ foo: 'bar' }) })

      expect(result.ok).toEqual(true)
      expect(result.status).toEqual(200)
      await expect(result.text()).resolves.toEqual('world!')
      expect(cb).toBeCalledWith({ foo: 'bar' })
    })
  })

  describe('route method given null', () => {
    it('given method is GET', async () => {
      router.all('/hello', ctx => { ctx.body = 'world!' })
      testAddress = app.use(router.routes())
        .listen(0).address()
      const result = await fetch(baseUrl('/hello'))

      expect(result.ok).toEqual(true)
      expect(result.status).toEqual(200)
      await expect(result.text()).resolves.toEqual('world!')
    })

    it('given method is POST', async () => {
      const cb = vi.fn()
      router.all('/hello', ctx => { cb(ctx.request.body); ctx.body = 'world!' })
      testAddress = app.use(router.routes())
        .listen(0).address()

      const result = await fetch(baseUrl('/hello'), { method: 'POST', body: JSON.stringify({ foo: 'bar' }) })

      expect(result.ok).toEqual(true)
      expect(result.status).toEqual(200)
      await expect(result.text()).resolves.toEqual('world!')
      expect(cb).toBeCalledWith({ foo: 'bar' })
    })

    it('given method is PATCH', async () => {
      const cb = vi.fn()
      router.all('/hello', ctx => { cb(ctx.request.body); ctx.body = 'world!' })
      testAddress = app.use(router.routes())
        .listen(0).address()

      const result = await fetch(baseUrl('/hello'), { method: 'PATCH', body: JSON.stringify({ foo: 'bar' }) })

      expect(result.ok).toEqual(true)
      expect(result.status).toEqual(200)
      await expect(result.text()).resolves.toEqual('world!')
      expect(cb).toBeCalledWith({ foo: 'bar' })
    })

    it('given method is DELETE', async () => {
      const cb = vi.fn()
      router.all('/hello', ctx => { cb(ctx.request.body); ctx.body = 'world!' })
      testAddress = app.use(router.routes())
        .listen(0).address()

      const result = await fetch(baseUrl('/hello'), { method: 'DELETE', body: JSON.stringify({ foo: 'bar' }) })

      expect(result.ok).toEqual(true)
      expect(result.status).toEqual(200)
      await expect(result.text()).resolves.toEqual('world!')
      expect(cb).toBeCalledWith({ foo: 'bar' })
    })
  })

  describe('url not match', () => {
    it('should return 404 given request url is not match', async () => {
      router.get('/hello', ctx => {
        ctx.body = 'world!'
      })
      testAddress = app.use(router.routes())
        .listen(0).address()

      const result = await fetch(baseUrl('/'))

      expect(result.ok).toEqual(false)
      expect(result.status).toEqual(HttpStatus.NotFound)
      await expect(result.text()).resolves.toBe('')
    })

    it('should return 405 given request method is not match', async () => {
      router.post('/hello', ctx => {
        ctx.body = 'world!'
      })
      testAddress = app.use(router.routes())
        .listen(0).address()

      const result = await fetch(baseUrl('/hello'))

      expect(result.ok).toEqual(false)
      expect(result.status).toEqual(HttpStatus.MethodNotAllowed)
      await expect(result.text()).resolves.toBe('')
    })
  })
})
