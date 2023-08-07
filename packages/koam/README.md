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

## Sub-package

If you're looking for the ultimate in minimal packages and high customization, you can install the following subpackages separately. 
Of course, they are all included in the main package (`@mutoe/koam`).

- Koam core package [@mutoe/koam-core](https://github.com/mutoe/koam/tree/main/packages/koam-core)
- Router middleware [@mutoe/koam-router](https://github.com/mutoe/koam/tree/main/packages/koam-router)
- Logger middleware [@mutoe/koam-logger](https://github.com/mutoe/koam/tree/main/packages/koam-logger)

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

### 1. `ctx.assert` mast explicit declare `context` type
See [microsoft/Typescript#34523](https://github.com/microsoft/TypeScript/issues/34523)
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
   
### 2. Extend type

If you want to extend some property or method on the context or it's state, you can write the following code to extend it

```ts 
// extend.d.ts
import User from './src/user'
declare global {
   namespace Koa {
      export interface State {
         user?: User
      }
   }
} 
export {}

// your-code.ts
app.use(ctx => {
  console.log(ctx.state.user.name)
})
```

> You can refer the [koam-router `extend-koam.d.ts`](https://github.com/mutoe/koam/blob/main/packages/koam-router/src/extend-koam.d.ts) for more example.

### 3. Cookie

In order to reduce the package size, I don't have built-in cookie-related handling, as this is not required by all apps.

If you want to handle cookies, you can extend the middleware yourself, here is the [cookies](https://www.npmjs.com/package/cookies) example steps:

1. install the `cookies` and `@types/cookies` npm package
2. add `koam.d.ts` in your app 

    ```ts koam.d.ts
    import '@mutoe/koam'
    import type Cookies from 'cookies'

    declare module '@mutoe/koam' {
       interface Context {
          cookies: Cookies
       }
    }

    declare global {
       namespace Koa {
          // Others if you want extend
          interface State {
             user?: {id: number, email: string}
          }
       }

    }

    // Don't forgot this line
    export {} 
    ```

3. register the cookies in your app

   ```ts
   const app = new Koa()
   // init cookies before your middleware
   app.use((ctx, next) => {
       ctx.cookies = new Cookies(ctx.req, ctx.res, { secure: true })
       return next()
   })
   
   // your middlewares
   app.use(ctx => {
       ctx.cookies.set('key', 'value')
       ctx.cookies.get('key')
   })
   ```
