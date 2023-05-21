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

## Notes

1. Current only support `application/json` type request and response body
2. `ctx.assert` must explicit declare `Context` type. See [microsoft/Typescript#34523](https://github.com/microsoft/TypeScript/issues/34523)
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
