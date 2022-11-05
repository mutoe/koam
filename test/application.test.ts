import http from 'node:http'
import { mockConsole } from 'test/utils/mock-console'
import Koa, { Context } from '../src'

describe('# application', () => {
  let app: Koa
  let testAddress: any = {}
  const baseUrl = () => `http://localhost:${testAddress.port || 33_000}`

  beforeEach(() => { testAddress = 33_000; app = new Koa() })
  afterEach(() => app.close())

  it('should expose context property', async () => {
    expect(app.context).toBeNull()

    testAddress = app.listen(0).address()
    await fetch(baseUrl())

    expect(app.context).toBeInstanceOf(Context)
  })

  it('should as http server handler in native http server', async () => {
    app.use(ctx => { ctx.body = 'Hello' })
    const server = http.createServer(app.callback()).listen(0)
    testAddress = server.address()

    const res = await fetch(baseUrl())

    await expect(res.json()).resolves.toEqual('Hello')

    server.close()
  })

  describe('error handing', () => {
    const error = new Error('This is error message')

    it('should return Internal Server Error status', async () => {
      await mockConsole(async ({ consoleError }) => {
        testAddress = app.use(() => { throw error })
          .listen(0).address()

        const result = await fetch(baseUrl())

        expect(result.ok).toEqual(false)
        expect(result.status).toEqual(500)
        expect(result.statusText).toEqual('This is error message')
        await expect(result.text()).resolves.toBe('')
        expect(consoleError).toHaveBeenCalledWith(error)
      })
    })

    it('should call custom onError handler', async () => {
      await mockConsole(async ({ consoleError }) => {
        const onError = jest.fn()
        const app = new Koa({ onError })
        testAddress = app.use(() => { throw error })
          .listen(0).address()

        await fetch(baseUrl())

        expect(onError).toHaveBeenCalledWith(error, app.context)
        expect(consoleError).toHaveBeenCalledTimes(0)

        app.close()
      })
    })
  })

  describe('default error handling', () => {
    const error = new Error('This is error message')

    it('should not console anything when silent is true', async () => {
      await mockConsole(async ({ consoleError }) => {
        const app = new Koa({ silent: true })
        testAddress = app.use(() => { throw error })
          .listen(0).address()

        await fetch(baseUrl())

        expect(consoleError).toHaveBeenCalledTimes(0)

        app.close()
      })
    })

    it('should not console anything when response status is 4xx', async () => {
      await mockConsole(async ({ consoleError }) => {
        testAddress = app.use(ctx => { ctx.throw(400) })
          .listen(0).address()

        await fetch(baseUrl())

        expect(consoleError).toHaveBeenCalledTimes(0)
      })
    })

    it('should console error detail when response status is 5xx', async () => {
      await mockConsole(async ({ consoleError, consoleDebug }) => {
        testAddress = app.use(() => { throw error })
          .listen(0).address()

        await fetch(baseUrl())

        expect(consoleError).toHaveBeenCalledWith(error)
        expect(consoleDebug).toHaveBeenCalledWith(app.context)
      })
    })
  })
})
