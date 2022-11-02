import { Context } from 'src/context'
import { mockConsoleError } from 'test/utils/mock-console'
import Koa from '../src'

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

  describe('error handing', () => {
    const error = new Error('This is error message')

    it('should return Internal Server Error status', async () => {
      await mockConsoleError(async (consoleError) => {
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

    it('should call onError handler', async () => {
      await mockConsoleError(async (consoleError) => {
        const onError = jest.fn()
        const app = new Koa({ onError })
        testAddress = app.use(() => { throw error })
          .listen(0).address()

        await fetch(baseUrl())

        expect(onError).toHaveBeenCalledWith(error)
        expect(consoleError).toHaveBeenCalledTimes(0)

        app.close()
      })
    })
  })
})
