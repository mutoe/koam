import Koa, { HttpStatus } from '@mutoe/koam'
import Router from 'src'

declare global {
  namespace Koa {
    interface State {
      foo: any
    }
  }
}

describe('Nested routes', () => {
  let app = new Koa()
  let router = new Router()
  let testAddress: any = {}
  const cb = vi.fn()
  const baseUrl = (path: string = '') => `http://localhost:${testAddress.port || 33_000}${path}`

  beforeEach(() => { testAddress = {}; app = new Koa(); router = new Router() })
  afterEach(() => void app.close())

  describe('constructor arguments', () => {
    it('should set the prefix to route', async () => {
      router = new Router({ prefix: '/api' })
      router.get('/hello', ctx => { ctx.body = 'world!' })
      testAddress = app.use(router.routes())
        .listen(0).address()

      const result = await fetch(baseUrl('/api/hello'))
      expect(result.ok).toEqual(true)
      expect(result.status).toEqual(HttpStatus.Ok)
    })

    it('should cannot access the origin route without prefix', async () => {
      router = new Router({ prefix: '/api' })
      router.get('/hello', ctx => { ctx.body = 'world!' })
      testAddress = app.use(router.routes())
        .listen(0).address()

      const result = await fetch(baseUrl('/hello'))
      expect(result.ok).toEqual(false)
      expect(result.status).toEqual(HttpStatus.NotFound)
    })
  })

  describe('router.prefix(path)', () => {
    it('should prepend the new prefix when call prefix after define route', async () => {
      router = new Router({ prefix: '/v1' })
      router.get('/hello', ctx => { ctx.body = '' })
      router.prefix('/v2')
      testAddress = app.use(router.routes())
        .listen(0).address()

      let result = await fetch(baseUrl('/v1/hello'))
      expect(result.ok).toEqual(false)
      expect(result.status).toEqual(HttpStatus.NotFound)
      result = await fetch(baseUrl('/v2/v1/hello'))
      expect(result.ok).toEqual(true)
    })

    it('should replace to the new prefix when call prefix after define route', async () => {
      router = new Router({ prefix: '/v1' })
      router.prefix('/v2')
      router.get('/hello', ctx => { ctx.body = '' })
      testAddress = app.use(router.routes())
        .listen(0).address()

      let result = await fetch(baseUrl('/v1/hello'))
      expect(result.ok).toEqual(false)
      expect(result.status).toEqual(HttpStatus.NotFound)
      result = await fetch(baseUrl('/v2/hello'))
      expect(result.ok).toEqual(true)
    })
  })

  describe('router.use()', () => {
    it('should combine app middleware and router middleware', async () => {
      app.use((ctx, next) => { ctx.state.foo = 1; return next() })
      router.get('/api/hello', (ctx, next) => { ctx.body = ''; return next() })
      router.use(
        (ctx, next) => { cb(ctx.state.foo); ctx.state.foo += 1; return next() },
        ctx => { cb(ctx.state.foo) },
      )
      testAddress = app.use(router.routes())
        .listen(0).address()

      const result = await fetch(baseUrl('/api/hello'))
      expect(result.ok).toEqual(true)
      expect(cb).toHaveBeenNthCalledWith(1, 1)
      expect(cb).toHaveBeenNthCalledWith(2, 2)
    })

    it('should combine app middleware and router middleware on special path', async () => {
      app.use((ctx, next) => { ctx.state.foo = 1; return next() })
      router.get('/api?/hello', (ctx, next) => { ctx.state.foo = 2; ctx.body = ''; return next() })
      router.use('/api/*', (ctx, next) => { cb(ctx.state.foo); return next() })
      testAddress = app.use(router.routes())
        .listen(0).address()

      let result = await fetch(baseUrl('/hello'))
      expect(result.ok).toEqual(true)
      expect(cb).not.toBeCalled()

      result = await fetch(baseUrl('/api/foo'))
      expect(result.ok).toEqual(false)

      result = await fetch(baseUrl('/api/hello'))
      expect(result.ok).toEqual(true)
      expect(cb).toBeCalledWith(2)
    })
  })

  describe('router.use(anotherRouter))', () => {
    it('should allow nested routes declare', async () => {
      const posts = new Router()
      posts.get('/', ctx => { ctx.body = `posts in forums ${ctx.params?.fid}` })
      posts.get('/:pid', ctx => { ctx.body = `post ${ctx.params?.pid}` })

      const forums = new Router()
      forums.use('/forums/:fid/posts', posts.routes())

      testAddress = app.use(forums.routes())
        .listen(0).address()

      let result = await fetch(baseUrl('/forums/123/posts'))
      expect(result.ok).toEqual(true)
      expect(result.text()).resolves.toEqual('posts in forums 123')

      result = await fetch(baseUrl('/forums/123/posts/456'))
      expect(result.ok).toEqual(true)
      expect(result.text()).resolves.toEqual('post 456')
    })
  })
})
