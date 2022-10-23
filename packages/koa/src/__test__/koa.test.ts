import http from 'node:http'
import Koa from '../koa'

jest.mock('node:http')

describe('# Koa', () => {
  const httpServer: any = { listen: jest.fn() }

  beforeEach(() => {
    jest.spyOn(http, 'createServer').mockReturnValue(httpServer)
  })

  it('should can listen default port success', () => {
    const app = new Koa()

    app.listen(3000)

    expect(httpServer.listen).toBeCalledWith(3000)
  })
})
