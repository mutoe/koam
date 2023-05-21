import Koa from '@mutoe/koam'
import Router from '../index'

describe('# Router', () => {
  describe('when call route', () => {
    it('return correct middleware', () => {
      const router = new Router()
      const fn = vi.fn()
      const middleware: Koa.Middleware = ctx => { fn(ctx) }
      router.get('user', '/users/:id', middleware)

      const result = router.route('user')
      expect(result).not.toBeNull()
      const mockedContext = { foo: 'bar' } as any
      result!(mockedContext, vi.fn())
      expect(fn).toBeCalledWith(mockedContext)
    })
  })
})
