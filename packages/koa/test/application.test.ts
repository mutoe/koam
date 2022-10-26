import { mockConsoleError } from 'src/utils/test-utils'
import Koa from '../src'

describe('# application', () => {
  let app: Koa
  let testAddress: any = {}
  const baseUrl = () => `http://localhost:${testAddress.port || 33_000}`

  beforeEach(() => { testAddress = 33_000; app = new Koa() })
  afterEach(() => app.close())

  describe('error handing', () => {
    const error = new Error('this is error message')

    it('should return Internal Server Error status', async () => {
      await mockConsoleError(async (consoleError) => {
        testAddress = app.use(() => { throw error })
          .listen(0).address()

        const result = await fetch(baseUrl())

        expect(result).toMatchObject({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        })
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
