import Koa from '../koa'

describe('# Koa', () => {
  it('should can listen default port success', () => {
    const app = new Koa()

    app.listen()

    // TODO: assert result
  })
})
