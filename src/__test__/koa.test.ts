import http from 'node:http'
import Koa from '../koa'

jest.mock('node:http')

describe('# Koa', () => {
  const httpServer: any = { listen: jest.fn(), on: jest.fn() }

  beforeEach(() => {
    jest.spyOn(http, 'createServer').mockReturnValue(httpServer)
  })

  it('should can listen default port success', () => {
    const app = new Koa()

    app.listen(3000)

    expect(httpServer.listen).toBeCalledWith(3000)
  })

  describe('use middleware', () => {
    const app = new Koa()
    const middleware = jest.fn()
    const result = app.use(middleware)

    it('should return it self', () => {
      expect(result).toBe(app)
    })

    it('should pass in the context object to middle ware first args', () => {
      expect(middleware).toBeCalledWith({})
    })
  })
})
