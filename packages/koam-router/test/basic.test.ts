import Koa, { HttpStatus } from '@mutoe/koam'
import Router from 'src'

describe('Koam router basic feature', () => {
  let app = new Koa()
  let router = new Router()
  let testAddress: any = {}
  const baseUrl = (path: string = '') => `http://localhost:${testAddress.port || 33_000}${path}`

  beforeEach(() => { testAddress = {}; app = new Koa(); router = new Router() })
  afterEach(() => void app.close())

  it('should get correctly response given request url is match', async () => {
    router.get('/hello', ctx => { ctx.body = 'world!' })
    testAddress = app.use(router.routes())
      .listen(0).address()

    const result = await fetch(baseUrl('/hello'))

    expect(result.ok).toEqual(true)
    expect(result.status).toEqual(200)
    await expect(result.text()).resolves.toEqual('world!')
  })

  describe('Context parameters', () => {
    it('should return correct context parameters', async () => {
      const cb = vi.fn()
      router.get('/:category/:title', ctx => { cb(ctx.params) })
      testAddress = app.use(router.routes())
        .listen(0).address()

      const result = await fetch(baseUrl('/programming/how-to-node'))

      expect(result.ok).toEqual(true)
      expect(cb).toBeCalledWith({ category: 'programming', title: 'how-to-node' })
    })

    it('should return correct context parameters given route is "/articles/:aid?/comments/:cid?"', async () => {
      const cb = vi.fn()
      router.get('/articles/:aid?/comments/:cid?', ctx => { cb(ctx.params) })
      testAddress = app.use(router.routes())
        .listen(0).address()

      const result = await fetch(baseUrl('/articles/comments/123'))

      expect(result.ok).toEqual(true)
      expect(cb).toBeCalledWith({ cid: '123', aid: undefined })
    })

    it('should return undefined when route is unnamed', async () => {
      const cb = vi.fn()
      router.get('/id/(\\d+)', ctx => { cb(ctx.params) })
      testAddress = app.use(router.routes())
        .listen(0).address()

      const result = await fetch(baseUrl('/id/123'))

      expect(result.ok).toEqual(true)
      expect(cb).toBeCalledWith(undefined)
    })
  })

  describe('Allowed methods', () => {
    it('should return 404 when method not matched', async () => {
      router.post('/hello', ctx => { ctx.body = 'world!' })
      testAddress = app.use(router.routes())
        .listen(0).address()

      const result = await fetch(baseUrl('/hello'))

      expect(result.status).toEqual(HttpStatus.NotFound)
      expect(result.headers.get('Allow')).toBeNull()
    })

    it('should return 405 when method not matched', async () => {
      router.post('/hello', ctx => { ctx.body = 'world!' })
      router.patch('/hello', ctx => { ctx.body = 'world!' })
      testAddress = app
        .use(router.routes())
        .use(router.allowedMethods())
        .listen(0).address()

      const result = await fetch(baseUrl('/hello'))

      expect(result.status).toEqual(HttpStatus.MethodNotAllowed)
      expect(result.headers.get('Allow')).toEqual('POST, PATCH')
    })

    it('should return 405 when method not matched and allowedMethods before using routes', async () => {
      router.post('/hello', ctx => { ctx.body = 'world!' })
      router.patch('/hello', ctx => { ctx.body = 'world!' })
      testAddress = app
        .use(router.allowedMethods())
        .use(router.routes())
        .listen(0).address()

      const result = await fetch(baseUrl('/hello'))

      expect(result.status).toEqual(HttpStatus.MethodNotAllowed)
      expect(result.headers.get('Allow')).toEqual('POST, PATCH')
    })

    it('should return 200 when method matched', async () => {
      router.get('/hello', ctx => { ctx.body = 'world!' })
      router.patch('/hello', ctx => { ctx.body = 'world!' })
      testAddress = app
        .use(router.routes())
        .use(router.allowedMethods())
        .listen(0).address()

      const result = await fetch(baseUrl('/hello'))

      expect(result.status).toEqual(HttpStatus.Ok)
    })
  })
})
