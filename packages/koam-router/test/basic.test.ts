import Koa, { HttpStatus } from '@mutoe/koam'
import Router from '../src'

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
})
