import * as http from 'node:http'
import { mockConsole } from '../../../test-utils/mock-console'
import Koa, { HttpStatus } from '../src'

describe('# application', () => {
  let app: InstanceType<typeof Koa>
  let testAddress: any = {}
  const errorMessage = 'This is error message'
  const baseUrl = (path: string = '') => `http://localhost:${testAddress.port || 33_000}${path}`

  beforeEach(() => { testAddress = {}; app = new Koa() })
  afterEach(() => {
    vi.useRealTimers()
    return void new Promise(resolve => app.close(resolve))
  })

  describe('hello world', () => {
    it('should get correct response', async () => {
      testAddress = app.use(ctx => { ctx.body = 'Hello world!' })
        .listen().address()

      const res = await fetch(baseUrl())

      expect(res.status).toEqual(200)
      expect(res.statusText).toEqual('Ok')
      await expect(res.text()).resolves.toEqual('Hello world!')
    })

    it('should as http server handler in native http server', async () => {
      app.use(ctx => { ctx.body = 'Hello' })
      const server = http.createServer(app.callback()).listen(0)
      testAddress = server.address()

      const res = await fetch(baseUrl())

      await expect(res.text()).resolves.toEqual('Hello')

      server.close()
    })
  })

  describe('default status', () => {
    it('should get NotFound when no body set', async () => {
      const fn = vi.fn()
      testAddress = app
        .use(ctx => fn(ctx.body))
        .listen().address()

      const res = await fetch(baseUrl())

      expect(res.ok).toBe(false)
      expect(res.status).toEqual(HttpStatus.NotFound)
    })

    it.each([
      { body: undefined, status: HttpStatus.NoContent },
      { body: null, status: HttpStatus.NoContent },
      { body: '', status: HttpStatus.Ok },
      { body: false, status: HttpStatus.Ok },
      { body: 'Hello', status: HttpStatus.Ok },
      { body: { foo: 'bar' }, status: HttpStatus.Ok },
    ])('should get $status when body set to "$body"', async ({ body, status }) => {
      testAddress = app
        .use(ctx => { ctx.body = body })
        .listen().address()

      const res = await fetch(baseUrl())

      expect(res.ok).toBe(true)
      expect(res.status).toEqual(status)
    })
  })

  describe('error handing', () => {
    const error = new Error(errorMessage)

    it('should return Internal Server Error status', async () => {
      await mockConsole(async ({ consoleError }) => {
        testAddress = app.use(() => { throw error })
          .listen(0).address()

        const result = await fetch(baseUrl())

        expect(result.ok).toEqual(false)
        expect(result.status).toEqual(500)
        expect(result.statusText).toEqual(errorMessage)
        await expect(result.text()).resolves.toBe('')
        expect(consoleError).toHaveBeenCalledWith(error)
      })
    })

    it('should call custom onError handler', async () => {
      await mockConsole(async ({ consoleError }) => {
        const onError = vi.fn<any>()
        const app = new Koa({ onError })
        testAddress = app.use(() => { throw error })
          .listen(0).address()

        await fetch(baseUrl())

        expect(onError).toHaveBeenCalledWith(error, expect.any(Object))
        expect(onError.mock.calls[0][1].response.status).toEqual(HttpStatus.InternalServerError)
        expect(onError.mock.calls[0][1].response.message).toEqual(errorMessage)
        expect(consoleError).toHaveBeenCalledTimes(0)

        app.close()
      })
    })
  })

  describe('default error handling', () => {
    const error = new Error(errorMessage)

    it('should not console anything when silent is true', async () => {
      await mockConsole(async ({ consoleError }) => {
        const app = new Koa({ silent: true })
        testAddress = app.use(() => { throw error })
          .listen(0).address()

        await fetch(baseUrl())

        expect(consoleError).toHaveBeenCalledTimes(0)

        app.close()
      })
    })

    it('should not console anything when response status is 4xx', async () => {
      await mockConsole(async ({ consoleError }) => {
        testAddress = app.use(ctx => { ctx.throw(400) })
          .listen(0).address()

        await fetch(baseUrl())

        expect(consoleError).toHaveBeenCalledTimes(0)
      })
    })

    it('should console error detail when response status is 5xx', async () => {
      await mockConsole(async ({ consoleError, consoleDebug }) => {
        testAddress = app.use(() => { throw error })
          .listen(0).address()

        await fetch(baseUrl('/foo?bar=1'))

        expect(consoleError).toHaveBeenCalledWith(error)
        expect(consoleDebug.mock.calls[0][0]).toEqual({
          app: {
            env: 'test',
            proxy: false,
            silent: false,
            address: expect.any(String),
            port: expect.any(Number),
          },
          state: {
            requestDateTime: expect.any(String),
            respondTime: expect.any(Number),
          },
          request: {
            ip: expect.any(String),
            method: 'GET',
            url: '/foo?bar=1',
            headers: {
              'accept': '*/*',
              'accept-encoding': 'gzip, deflate',
              'accept-language': '*',
              'connection': 'keep-alive',
              'host': `localhost:${testAddress.port}`,
              'sec-fetch-mode': 'cors',
              'user-agent': expect.any(String),
            },
            body: undefined,
          },
          response: {
            status: 500,
            message: errorMessage,
            headers: {
              'x-response-time': expect.any(String),
            },
            body: undefined,
          },
        })
      })
    })
  })

  describe('response body', () => {
    it('should convert to json string when response type is json format', async () => {
      testAddress = app.use(ctx => { ctx.body = { hello: 'world' } }).listen().address()

      const res = await fetch(baseUrl())

      expect(res.headers.get('content-type')).toEqual('application/json; charset=utf-8')
      await expect(res.json()).resolves.toEqual({ hello: 'world' })
    })

    it('should not convert response body when response type is plain text', async () => {
      testAddress = app.use(ctx => { ctx.body = 'Hello world !' }).listen().address()

      const res = await fetch(baseUrl())

      expect(res.headers.get('content-type')).toEqual('text/plain; charset=utf-8')
      await expect(res.text()).resolves.toEqual('Hello world !')
    })

    it('should not convert response body when response type is html', async () => {
      const htmlString = '<h1>Hello world !</h1>'
      testAddress = app.use(ctx => { ctx.body = htmlString }).listen().address()

      const res = await fetch(baseUrl())

      expect(res.headers.get('content-type')).toEqual('text/html; charset=utf-8')
      await expect(res.text()).resolves.toEqual(htmlString)
    })

    it('should not rewrite the content type when set body', async () => {
      testAddress = app.use(ctx => {
        ctx.type = 'application/json'
        ctx.body = '{"foo": "bar"}'
      }).listen().address()

      const response = await fetch(baseUrl())

      expect(response.headers.get('Content-Type')).toContain('application/json')
      await expect(response.json()).resolves.toEqual({ foo: 'bar' })
    })
  })

  describe('concurrently', () => {
    it('should can process multiple request at the same time', async () => {
      vi.useFakeTimers()
      testAddress = app
        .use(async ctx => {
          const timeout = Number(ctx.query.timeout) || 0
          if (timeout)
            await new Promise(resolve => setTimeout(resolve, timeout))
          ctx.body = `T ${timeout}`
        })
        .listen()
        .address()

      const firstRequestPromise = fetch(baseUrl('/?timeout=10000'))
      const secondRequestResponse = await fetch(baseUrl('/?timeout=0'))
      await expect(secondRequestResponse.text()).resolves.toEqual('T 0')
      expect(firstRequestPromise).toBeInstanceOf(Promise)

      vi.runOnlyPendingTimers()
      const firstRequestResponse = await firstRequestPromise
      await expect(firstRequestResponse.text()).resolves.toEqual('T 10000')
    })
  })
})
