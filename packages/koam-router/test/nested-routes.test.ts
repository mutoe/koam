import Koa, { HttpStatus } from '@mutoe/koam'
import Router from 'src'

describe('Koam router nested routes', () => {
  let app = new Koa()
  let router = new Router()
  let testAddress: any = {}
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
})
