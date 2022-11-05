import assert from 'node:assert'
import http from 'node:http'
import { ListenOptions } from 'node:net'
import Context from 'src/context'
import { HttpStatus } from 'src/enums'
import { AppError, Koa } from 'src/index'
import { bodyParser } from 'src/middlewares'
import { deepMerge } from 'src/utils/deep-merge'

export type HttpServer = http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>

export default class Application {
  context: Context | null = null
  /** App error handler.\nYou can log, send request, write file, trigger event and do anything in here */
  onError: Koa.ErrorHandler

  readonly config: Koa.Config = {
    silent: false,
    proxy: false,
    proxyIpHeader: 'x-forwarded-for',
    maxIpsCount: 0,
  }

  private httpServer?: HttpServer
  private middlewares: Koa.Middleware[] = []

  constructor (config: Partial<Koa.Config & {onError: Koa.ErrorHandler}> = {}) {
    const { onError, ...restConfig } = config
    this.onError = onError || defaultErrorHandler
    this.config = deepMerge(this.config, restConfig)
    this.middlewares.push(bodyParser())
  }

  use (middleware: Koa.Middleware): this {
    this.middlewares.push(middleware)
    return this
  }

  listen (port?: number, hostname?: string, backlog?: number, listeningListener?: () => void): HttpServer
  listen (port?: number, hostname?: string, listeningListener?: () => void): HttpServer
  listen (port?: number, backlog?: number, listeningListener?: () => void): HttpServer
  listen (port?: number, listeningListener?: () => void): HttpServer
  listen (path: string, backlog?: number, listeningListener?: () => void): HttpServer
  listen (path: string, listeningListener?: () => void): HttpServer
  listen (options: ListenOptions, listeningListener?: () => void): HttpServer
  listen (handle: any, backlog?: number, listeningListener?: () => void): HttpServer
  listen (handle: any, listeningListener?: () => void): HttpServer
  listen (...args: any[]): HttpServer {
    this.httpServer = http.createServer(this.callback())
    return this.httpServer.listen(...args)
  }

  close (callback?: (error?: Error) => void): HttpServer | undefined {
    this.context = null!
    this.middlewares = null!
    return this.httpServer?.close(callback)
  }

  callback (): http.RequestListener {
    const middleware = this.composeMiddleware()

    return async (req, res) => {
      this.context = new Context(this, req, res)
      try {
        await middleware()
      } catch (error) {
        await Promise.resolve(this.handleError(error)).catch(console.error)
      }
      if (this.context.body !== undefined && this.context.body !== null) {
        this.context.res.write(JSON.stringify(this.context.body))
      }
      this.context.res.end()
    }
  }

  private handleError (error: unknown): void | Promise<void> {
    assert.ok(this.context, 'Context not exist!')
    if (error instanceof AppError) {
      this.context.status = error.status
      this.context.body = error.expose ? error.detail : null
    } else if (!(error instanceof Error)) {
      error = new Error(error?.toString())
    }
    if (!HttpStatus.isError(this.context.status)) {
      this.context.status = HttpStatus.InternalServerError
    }
    assert.ok(error instanceof Error)
    if (!error.message) error.message = HttpStatus.getMessage(this.context.status)
    this.context.message = error.message
    this.onError(error, this.context)
  }

  private composeMiddleware (): Koa.MiddlewareGenerator {
    return () => {
      let n = -1
      const dispatch = (i: number): any => {
        if (n >= i) throw new Error('next() called more than one time in the same middleware function')
        n = i
        const fn = this.middlewares[i]
        if (!fn) return
        return fn(this.context!, dispatch.bind(undefined, i + 1))
      }
      return dispatch(0)
    }
  }
}

const defaultErrorHandler = (error: unknown, context: Context): void => {
  if (context.app.config.silent) return
  if (error instanceof AppError && error.expose) return
  assert(error instanceof Error)

  console.debug(context)
  console.error(error)
}
