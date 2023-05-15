import assert from 'node:assert'
import http from 'node:http'
import type { ListenOptions } from 'node:net'
import net from 'node:net'
import Context from './context'
import { HttpStatus } from './enums'
import { bodyParser, responseTime } from './middlewares'
import { compose } from './utils/compose'
import Koa, { AppError, noop } from './index'

export type HttpServer = http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>

export default class Application implements Koa.Config {
  context: Context | null = null

  /**
   * Env config
   * @description If not set env, will read `process.env.NODE_ENV`.
   * @default 'development'
   */
  env: string
  /**
   * @description You can log, send request, write file, trigger event and do anything you want.
   */
  onError: Koa.ErrorHandler
  /**
   * @description Whether print the logs.
   * @default false
   */
  silent: boolean
  /**
   * @description Whether there is a proxy such as nginx before application
   * @default false
   */
  proxy: boolean
  /**
   * @description If you have proxy, specify the header of the forwarding IPs.
   * @default x-forwarded-for
   */
  proxyIpHeader: string
  /**
   * @description If you have proxy, specify how many proxy server you have.
   * @default 0 (unlimited)
   */
  maxIpsCount: number

  private httpServer?: HttpServer
  private middlewares: Koa.Middleware[] = []

  constructor (config: Partial<Koa.Config> = {}) {
    const { env, onError, silent, proxy, proxyIpHeader, maxIpsCount } = config
    this.env = env || process.env.NODE_ENV || 'development'
    this.onError = onError ?? defaultErrorHandler
    this.silent = silent ?? false
    this.proxy = proxy ?? false
    this.proxyIpHeader = proxyIpHeader || 'x-forwarded-for'
    this.maxIpsCount = maxIpsCount || 0

    this.middlewares.push(
      responseTime(),
      bodyParser(),
    )
  }

  get isDevelopment (): boolean { return this.env === 'development' }
  get isProduction (): boolean { return this.env === 'production' }

  /**
   * Get server listen address
   *
   * @example `192.168.1.1:8080`
   * @example `[::1]:8080`
   */
  get address (): string {
    let address = this.httpServer?.address() ?? ''
    if (typeof address !== 'string') {
      address = address.address
    }
    return address
  }

  get port (): number | null {
    try {
      return (this.httpServer?.address() as net.AddressInfo).port
    } catch {
      return null
    }
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
    const middleware = compose(this.middlewares)

    return async (req, res) => {
      this.context = new Context(this, req, res)

      try {
        await middleware(this.context, noop)
      } catch (error) {
        await Promise.resolve(this.handleError(error)).catch(console.error)
      }
      this.respond()
    }
  }

  toJSON (): JsonValue {
    return {
      env: this.env,
      silent: this.silent,
      proxy: this.proxy,
      address: this.address,
      port: this.port,
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

  private respond (): void {
    assert(this.context)
    this.context.message ||= HttpStatus.getMessage(this.context.status)
    if (this.context.body !== undefined && this.context.body !== null) {
      const body = ['text/plain', 'text/html'].includes(this.context.response.type)
        ? this.context.body
        : JSON.stringify(this.context.body)
      this.context.res.write(body)
    }
    this.context.res.end()
  }
}

const defaultErrorHandler = (error: unknown, context: Context): void => {
  if (context.app.silent) return
  if (error instanceof AppError && error.expose) return
  assert(error instanceof Error)

  console.debug(context.toJSON())
  console.error(error)
}
