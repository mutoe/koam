# Koam-logger

Implement a simple Koa logger.

THIS FRAMEWORK HAVE NOT BEEN STRICTLY TESTED, PLEASE DO NOT USE IT IN PRODUCTION !  
许多功能未经严格测试，请勿用于生产目的！

## Usage

```typescript
// entrypoint
import Koa from '@mutoe/koam-core'
import {logger} from '@mutoe/koam-logger'

const app = new Koa()
const router = new Logger()

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
  ctx.log('Hello, Koam!') // -> echo '[My App] [LOG] Hello, Koam!'
  ctx.logger.error('Hello, Koam!') // -> echo '[My App] [ERROR] Hello, Koam!'
})
```
