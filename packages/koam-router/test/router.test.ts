import Koa from '@mutoe/koam'
import Router from '../src'
import { mockConsole } from './utils/mock-console'

describe('Koam router', () => {
  let app = new Koa()
  let testAddress: any = {}
  const baseUrl = (path: string = '') => `http://localhost:${testAddress.port || 33_000}${path}`

  beforeEach(() => { testAddress = {}; app = new Koa() })
  afterEach(() => app.close())

  it('should', () => {
    mockConsole(async ({ consoleLog }) => {
      const router = new Router()
      app.use(router.routes())
      testAddress = app.listen().address()

      await fetch(baseUrl())

      expect(consoleLog).toHaveBeenCalledTimes(1)
    })
  })
})
