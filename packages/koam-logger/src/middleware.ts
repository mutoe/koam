import type { Context } from '@mutoe/koam-core'
import { type LogLevel, Logger, type LoggerOptions } from './logger'

interface ContextLoggerOptions extends LoggerOptions {
  /**
   * Custom Request Logger
   *
   * A function that logs the request details of a context object.
   *
   * It should be noted that the content of the context depends on when you call the log method.
   * For example, if you haven't got a response when you call the log, then the response won't fetch the content.
   *
   * @param context - The context object of the Koa request model
   * @returns The response of the request.
   * @defaults ```
   * ctx => ({
   *   method: ctx.method,
   *   url: ctx.url,
   *   status: ctx.status
   * })
   * ```
   */
  customRequestLogger?: (context: Context) => JsonValue
}

/**
 * Middleware that logs information and errors using a logger.
 *
 * @param args - The options for the logger.
 * @returns Koa.Middleware The middleware function.
 */
export const logger = ((args: ContextLoggerOptions = {}) => {
  let { customRequestLogger, ...loggerArgs } = args
  const logger = new Logger(loggerArgs)

  if (customRequestLogger === undefined) {
    customRequestLogger = (ctx: Context) => ({
      method: ctx.method,
      url: ctx.url,
      status: ctx.status,
    })
  }

  function logCaller(level: LogLevel, ctx: Context, ...args: any[]): void {
    if (level === 'silent')
      return
    if (customRequestLogger)
      args.push(JSON.stringify(customRequestLogger(ctx)))

    logger[level](...args)
  }

  return async function (ctx: Context, next) {
    const log: any = logCaller.bind(null, 'log', ctx)
    log.error = logCaller.bind(null, 'error', ctx)
    log.warn = logCaller.bind(null, 'warn', ctx)
    log.log = logCaller.bind(null, 'log', ctx)
    log.info = logCaller.bind(null, 'info', ctx)
    log.debug = logCaller.bind(null, 'debug', ctx)

    ctx.log = log
    ctx.logger = logger
    await next()
  }
}) satisfies Koa.MiddlewareGenerator
