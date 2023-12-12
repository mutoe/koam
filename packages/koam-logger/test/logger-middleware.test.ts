import { existsSync, readFileSync, rmSync } from 'node:fs'
import Koa, { HttpStatus } from '@mutoe/koam-core'
import { logger } from '../src'

describe('koam logger basic feature', () => {
  let app = new Koa()
  let testAddress: any = {}
  const baseUrl = (path: string = '') => `http://localhost:${testAddress.port || 33_000}${path}`

  beforeEach(() => {
    testAddress = {}
    app = new Koa()
  })
  afterEach(() => void app.close())

  it('should get correctly response given request url is match', async () => {
    const logDir = '/tmp/koam-logger-middleware-test'
    if (existsSync(logDir))
      rmSync(logDir, { recursive: true })

    app.use(logger({
      level: 'debug',
      drivers: [
        { type: 'file', dir: logDir },
      ],
    }))
    testAddress = app.use(ctx => {
      ctx.status = HttpStatus.Ok
      ctx.body = 'foo'
      ctx.log.debug('debug message')
      ctx.log.info('info message')
      ctx.log.warn('warn message')
      ctx.log.error('error message')
      ctx.log('log message')
    })
      .listen(0).address()

    const result = await fetch(baseUrl())
    expect(result.ok).toEqual(true)

    await new Promise(resolve => setTimeout(resolve, 200))
    expect(existsSync(`${logDir}/output.log`)).toEqual(true)
    const content = readFileSync(`${logDir}/output.log`, 'utf-8')
    expect(content).toContain('{"method":"GET","url":"/","status":200}')
    expect(content).toContain('debug message')
  })
})
