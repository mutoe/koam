import { existsSync, readFileSync, rmSync } from 'node:fs'
import { mockConsole } from '../../../../test-utils/mock-console'
import { Logger } from '../logger'

describe('# Logger', () => {
  it('should call console by default writer', () => {
    mockConsole(async ({ consoleLog, consoleInfo, consoleWarn, consoleDebug, consoleError }) => {
      const logger = new Logger()
      logger.level = 'debug'

      logger.debug('debug message')
      logger.info('info message')
      logger.log('log message')
      logger.warn('warn message')
      logger.error('error message')

      expect(consoleDebug).toBeCalledWith('[DEBUG]', 'debug message')
      expect(consoleInfo).toBeCalledWith('[INFO]', 'info message')
      expect(consoleLog).toBeCalledWith('[LOG]', 'log message')
      expect(consoleWarn).toBeCalledWith('[WARN]', 'warn message')
      expect(consoleError).toBeCalledWith('[ERROR]', 'error message')
    })
  })

  it('should prefix with special module name when set module name', () => {
    mockConsole(async ({ consoleLog, consoleInfo, consoleWarn, consoleDebug, consoleError }) => {
      const logger = new Logger('Foo', { level: 'debug' })

      logger.debug('debug message')
      logger.info('info message')
      logger.log('log message')
      logger.warn('warn message')
      logger.error('error message')

      expect(consoleDebug).toBeCalledWith('[DEBUG]', '[Foo]', 'debug message')
      expect(consoleInfo).toBeCalledWith('[INFO]', '[Foo]', 'info message')
      expect(consoleLog).toBeCalledWith('[LOG]', '[Foo]', 'log message')
      expect(consoleWarn).toBeCalledWith('[WARN]', '[Foo]', 'warn message')
      expect(consoleError).toBeCalledWith('[ERROR]', '[Foo]', 'error message')
    })
  })

  it('should call console only greater than info level', () => {
    mockConsole(async ({ consoleLog, consoleInfo, consoleWarn, consoleDebug, consoleError }) => {
      const logger = new Logger({ level: 'info' })

      logger.debug('debug message')
      logger.info('info message')
      logger.log('log message')
      logger.warn('warn message')
      logger.error('error message')

      expect(consoleDebug).not.toBeCalled()
      expect(consoleInfo).toBeCalledWith('[INFO]', 'info message')
      expect(consoleLog).toBeCalledWith('[LOG]', 'log message')
      expect(consoleWarn).toBeCalledWith('[WARN]', 'warn message')
      expect(consoleError).toBeCalledWith('[ERROR]', 'error message')
    })
  })

  it('should call console only greater than log level with default level', () => {
    mockConsole(async ({ consoleLog, consoleInfo, consoleWarn, consoleDebug, consoleError }) => {
      const logger = new Logger()

      logger.debug('debug message')
      logger.info('info message')
      logger.log('log message')
      logger.warn('warn message')
      logger.error('error message')

      expect(consoleDebug).not.toBeCalled()
      expect(consoleInfo).not.toBeCalled()
      expect(consoleLog).toBeCalledWith('[LOG]', 'log message')
      expect(consoleWarn).toBeCalledWith('[WARN]', 'warn message')
      expect(consoleError).toBeCalledWith('[ERROR]', 'error message')
    })
  })

  it('should call console only greater than warn level', () => {
    mockConsole(async ({ consoleLog, consoleInfo, consoleWarn, consoleDebug, consoleError }) => {
      const logger = new Logger({ level: 'warn' })

      logger.debug('debug message')
      logger.info('info message')
      logger.log('log message')
      logger.warn('warn message')
      logger.error('error message')

      expect(consoleDebug).not.toBeCalled()
      expect(consoleInfo).not.toBeCalled()
      expect(consoleLog).not.toBeCalled()
      expect(consoleWarn).toBeCalledWith('[WARN]', 'warn message')
      expect(consoleError).toBeCalledWith('[ERROR]', 'error message')
    })
  })

  it('should call console only error level', () => {
    mockConsole(async ({ consoleLog, consoleInfo, consoleWarn, consoleDebug, consoleError }) => {
      const logger = new Logger({ level: 'error' })

      logger.debug('debug message')
      logger.info('info message')
      logger.log('log message')
      logger.warn('warn message')
      logger.error('error message')

      expect(consoleDebug).not.toBeCalled()
      expect(consoleInfo).not.toBeCalled()
      expect(consoleLog).not.toBeCalled()
      expect(consoleWarn).not.toBeCalled()
      expect(consoleError).toBeCalledWith('[ERROR]', 'error message')
    })
  })

  it('should not write and log when level set to silent', () => {
    mockConsole(async ({ consoleLog, consoleInfo, consoleWarn, consoleDebug, consoleError }) => {
      const logger = new Logger({ level: 'silent' })

      logger.debug('debug message')
      logger.info('info message')
      logger.log('log message')
      logger.warn('warn message')
      logger.error('error message')

      expect(consoleDebug).not.toBeCalled()
      expect(consoleInfo).not.toBeCalled()
      expect(consoleLog).not.toBeCalled()
      expect(consoleWarn).not.toBeCalled()
      expect(consoleError).not.toBeCalled()
    })
  })

  it('should write file when drive set to file', async () => {
    const dir = '/tmp/koam-test-log'
    if (existsSync(`${dir}/output.log`)) rmSync(dir, { recursive: true })
    vi.useFakeTimers({ now: new Date('2023-08-05T01:22:15.123+0800'), toFake: ['Date'] })

    const logger = new Logger('Koam Logger test', {
      level: 'debug',
      drivers: [{ type: 'file', dir }],
    })

    logger.debug('debug message')
    logger.info('info message')
    logger.log('log message')
    logger.warn('warn message')
    logger.error('error message')

    await new Promise(resolve => setTimeout(resolve, 10))

    expect(existsSync(`${dir}/output.log`)).toBe(true)

    const result = readFileSync(`${dir}/output.log`, 'utf-8')
    expect(result).toContain('2023-08-05T01:22:15.123+08:00 [DEBUG] [Koam Logger test] debug message')
    expect(result).toContain('2023-08-05T01:22:15.123+08:00 [INFO] [Koam Logger test] info message')
    expect(result).toContain('2023-08-05T01:22:15.123+08:00 [LOG] [Koam Logger test] log message')
    expect(result).toContain('2023-08-05T01:22:15.123+08:00 [WARN] [Koam Logger test] warn message')
    expect(result).toContain('2023-08-05T01:22:15.123+08:00 [ERROR] [Koam Logger test] error message')

    vi.useRealTimers()
  })
})
