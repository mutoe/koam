import Koa, { Context, HttpStatus } from '@mutoe/koam'
import Router from 'src'

declare global {
  namespace Koa {
    interface State {
      user?: { id: string }
    }
  }
}

describe('router.param', () => {
  let app = new Koa()
  let router = new Router()
  let testAddress: any = {}
  const cb = vi.fn()
  const baseUrl = (path: string = '') => `http://localhost:${testAddress.port || 33_000}${path}`

  beforeEach(() => { testAddress = {}; app = new Koa(); router = new Router() })
  afterEach(() => void app.close())

  it('could load param value in context', async () => {
    router.param('user', (ctx, next) => {
      const userId = ctx.params?.user
      if (!userId || userId === 'admin') return ctx.throw(HttpStatus.BadRequest)
      ctx.state.user = { id: userId }
      return next()
    })
      .get('/users/:user', (ctx: Context) => {
        ctx.body = ctx.state.user?.id
        ctx.assert(ctx.body)
        cb(ctx.body)
      })
    testAddress = app.use(router.routes())
      .listen(0).address()

    let response = await fetch(baseUrl('/users/1'))
    expect(response.ok).toEqual(true)
    expect(response.status).toEqual(HttpStatus.Ok)
    expect(cb).toBeCalledTimes(1)
    expect(cb).toBeCalledWith('1')

    response = await fetch(baseUrl('/users/admin'))
    expect(response.ok).toEqual(false)
    expect(response.status).toEqual(HttpStatus.BadRequest)
    expect(cb).toBeCalledTimes(1)
  })
})
