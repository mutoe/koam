import Koa from '@mutoe/koam-core'
import Router from 'src'

describe('multiple routes', () => {
  let app = new Koa()
  let testAddress: any = {}
  const cb = vi.fn()
  const baseUrl = (path: string = '') => `http://localhost:${testAddress.port || 33_000}${path}`

  beforeEach(() => { testAddress = {}; app = new Koa() })
  afterEach(() => void app.close())

  it('should can process multiple requests at the same time', async () => {
    const guestRouter = new Router({ prefix: '/api' })
      .get('/posts', async ctx => {
        await new Promise(resolve => setTimeout(resolve, 200))
        cb(1)
        ctx.body = [1, 2, 3]
      })
      .get('/login', async ctx => {
        await new Promise(resolve => setTimeout(resolve, 100))
        cb(2)
        ctx.body = 'success login'
      })

    testAddress = app
      .use(guestRouter.routes())
      .listen(0).address()

    const postsPromise = fetch(baseUrl('/api/posts'))
    const loginPromise = fetch(baseUrl('/api/login'))

    const loginResponse = await loginPromise
    await expect(loginResponse.text()).resolves.toEqual('success login')

    const postsResponse = await postsPromise
    await expect(postsResponse.json()).resolves.toEqual([1, 2, 3])

    expect(cb.mock.calls.map(it => it.at(0))).toEqual([2, 1])
  })
})
