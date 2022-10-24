import Koa from 'src/koa'

describe('# middleware', () => {
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
