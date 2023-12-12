import type Koa from '@mutoe/koam-core'
import Router from '../router'

describe('# Router', () => {
  let router = new Router()
  const cb = vi.fn()

  beforeEach(() => {
    router = new Router()
  })

  describe('when call route', () => {
    it('return correct middleware', () => {
      const middleware: Koa.Middleware = ctx => { cb(ctx) }
      router.get('user', '/users/:id', middleware)

      const route = router.route('user')
      expect(route).toBeTruthy()
      const mockedContext = { foo: 'bar' } as any
      const routerMiddleware = route!.middlewares.at(0)! as Koa.Middleware
      routerMiddleware(mockedContext, vi.fn())
      expect(cb).toBeCalledWith(mockedContext)
    })
  })

  describe('named routes', () => {
    it('should match correct route when call url method', () => {
      router.get('user', '/users/:id')
      expect(router.url('user', { id: 3 })).toEqual('/users/3')
      expect(router.url('user', { id: 3 }, { query: { foo: 1 } })).toEqual('/users/3?foo=1')
      expect(router.url('user', 3)).toEqual('/users/3')
      expect(router.url('user', 3, 4)).toEqual('/users/3')
      expect(router.url('user', 3, { query: { foo: 1 } })).toEqual('/users/3?foo=1')
      expect(router.url('user', 3, 4, { query: { foo: 1 } })).toEqual('/users/3?foo=1')
    })

    it('should match correct route when call static url method', () => {
      expect(Router.url('/users/:id', { id: 3 })).toEqual('/users/3')
      expect(Router.url('/users/:id', { id: 3 }, { query: { foo: 1 } })).toEqual('/users/3?foo=1')
      expect(Router.url('/users/:id', 3)).toEqual('/users/3')
      expect(Router.url('/users/:id', 3, 4)).toEqual('/users/3')
      expect(Router.url('/users/:id', 3, { query: { foo: 1 } })).toEqual('/users/3?foo=1')
      expect(Router.url('/users/:id', 3, 4, { query: { foo: 1 } })).toEqual('/users/3?foo=1')
    })
  })
})
