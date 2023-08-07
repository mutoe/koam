# Koam-logger

Implement a simple Koa logger.

THIS FRAMEWORK HAVE NOT BEEN STRICTLY TESTED, PLEASE DO NOT USE IT IN PRODUCTION !  
许多功能未经严格测试，请勿用于生产目的！

## Usage

```ts
// entrypoint
import Koa, { logger } from '@mutoe/koam'

const app = new Koa()

app.use(logger({
  moduleName: 'My App',
  drivers: [
    {
      type: 'console',
    },
    {
      type: 'file', 
      dir: '/tmp/my-app', 
      filename: 'my-app.log', 
      errorFilename: 'my-app-error.log'
    },
  ]
}))

// in anywhere
app.use(ctx => {
  ctx.log('Hello, Koam!') // -> echo '[LOG] [My App] Hello, Koam! {"method":"GET",status:404, ...}'
  ctx.status = 200
  ctx.log.error('Hello, Koam!') // -> echo '[ERROR] [My App] Hello, Koam! {"method":"GET",status:200,...}'
})

// And you can view the file in `/tmp/my-app/my-app.log`
// 2023-08-06T20:28:56.221+08:00 [LOG] [My App] Hello, Koam! {"method":"GET","url":"/","status":404}
// 2023-08-06T20:28:56.221+08:00 [ERROR] [My App] Hello, Koam! {"method":"GET","url":"/","status":200}
```

## Feature

1. Native STDOUT/STDERR output in the console
   ```ts
   import { Logger } from '@mutoe/koam'
   const logger = new Logger({
     drivers: [
        { type: 'console' },
     ]
   })
   ```
   
2. Write logs to files for logger platform like ELK or Grafana Loki
   ```ts
   import { Logger } from '@mutoe/koam'
   const logger = new Logger({
     drivers: [
        { 
          type: 'file',
          dir: '/tmp/my-app',
          // optional, default is `output.log`
          filename: 'my-app.log', 
          // optional, default is `output.log`
          errorFilename: 'my-app-error.log', 
        },
     ]
   })
   ```

3. Timestamp when the log is written
   ```ts
    import { Logger } from '@mutoe/koam'
    const logger = new Logger({
      // your custom timestamp format, default is ISO-8601 format
      datetimeFormat: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
    })
   ```
   It will auto set when using file driver

4. Use it as standalone logger utils
   ```ts
    import { Logger } from '@mutoe/koam-logger'
    const logger = new Logger()
   
    logger.debug('Hello')
    ```
   
5. If you're using logger as Koa middleware, it will automatically log the request or response information (by `customRequestLogger` option in `logger` middleware)
   ```ts
   import { logger } from '@mutoe/koam-logger'
   const app = new Koa()
   app.use(logger({
     customRequestLogger: ctx => ({
       method: ctx.method,
       url: ctx.url,
       traceId: ctx.traceId,
       status: ctx.status,
       responseTime: ctx.responseTime,
     })
   }))
   ``` 

   **NOTICE**: It should be noted that the content of the context depends on when you call the log method.
   For example, if you haven't got a response when you call the log, then the response won't fetch the content.
