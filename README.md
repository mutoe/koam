# Koam

[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/mutoe/koam/test.yml?style=for-the-badge)](https://github.com/mutoe/koam/actions)
[![Codecov](https://img.shields.io/codecov/c/github/mutoe/koam?style=for-the-badge&token=wpwmuKKaJX)](https://app.codecov.io/gh/mutoe/koam)

Implement a simple Koa-like http server with zero dependencies from scratch.

THIS FRAMEWORK HAVE NOT BEEN STRICTLY TESTED, PLEASE DO NOT USE IT IN PRODUCTION !  
许多功能未经严格测试，请勿用于生产目的！

## Advantage

- Lightweight (0 dependency)
- TypeScript friendly
- Built-in body parser middleware
- Built-in response time middleware

# Usage

```ts
import Koa from '@mutoe/koam'
import Router from '@mutoe/koam-router'

const app = new Koa()
const router = new Router()

router.post('/hello/:name', ctx => {
  console.log(ctx.request.body) // You can get json request body directly
  ctx.body = `Hello ${ctx.params.name}!`
})

app.use(router.routes())
app.listen(3000, () => console.log(`server is started at 3000...`))
```

## Notes

1. `ctx.assert` must explicit declare `Context` type. See [microsoft/Typescript#34523](https://github.com/microsoft/TypeScript/issues/34523)
   ```ts example.ts
   app.use(async (ctx: Context, next) => {
     //                ^^^^^^^
     const val: unknown = 1.2345
     //         ^^^^^^^
     ctx.assert(typeof val === 'number', 500)
     console.log(val.toFixed(2))
     //          ^^^ now val is number type
   })
   ```

## Roadmap

[Koam](https://github.com/mutoe/koam/tree/main/packages/koam#roadmap)

[Koam Router](https://github.com/mutoe/koam/tree/main/packages/koam-router#roadmap)
