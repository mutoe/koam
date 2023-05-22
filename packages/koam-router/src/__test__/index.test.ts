import Koa from '@mutoe/koam'
import { beforeEach } from 'vitest'
import Router from '../index'

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

      const result = router.route('user')
      expect(result).not.toBeNull()
      const mockedContext = { foo: 'bar' } as any
      result!(mockedContext, vi.fn())
      expect(cb).toBeCalledWith(mockedContext)
    })
  })

  describe('Named routes', () => {
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
