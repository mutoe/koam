# Koam-router

Implement a simple Koa-like router to create a web application.

THIS FRAMEWORK HAVE NOT BEEN STRICTLY TESTED, PLEASE DO NOT USE IT IN PRODUCTION !  
许多功能未经严格测试，请勿用于生产目的！

## Usage

```ts
import Koa from '@mutoe/koam-core'
import Router from '@mutoe/koam-router'

const app = new Koa()
const router = new Router()

app.use(router.routes())
```


## Roadmap

- [x] `new Route([options])`
  - [x] `options.prefix`
  - [ ] `options.exclusive`
  - [ ] `options.host`
- [x] `router.<get|post|put|patch|delete|all>(path, ...middlewares)`
  - [x] Named routes
  - [ ] Match host
  - [x] Multiple middlewares
- Path matching (lightweight `path-to-regexp`)
  - [x] named match
  - [x] unnamed match
  - [x] custom pattern match
  - [x] modifiers
- [x] `context.params`
- [x] `router.routes()`
- Nested routes
  - [x] `router.use([path], ...middlewares)`
  - [x] `router.use([path], ...anotherRouter.routes())`
- [x] `router.prefix(path)`
- [x] `router.allowedMethods([options])`
  - [ ] `options.throw`
  - [ ] `options.notImplemented`
  - [ ] `options.methodNotAllowed`
- [x] `router.redirect(source, destination, [status])`
- [x] `router.route(name)`
- [x] `router.url(name, params, [options])` 
  - [x] `router.url(name, ...paramStrings, [options])`
  - [x] `options.query`
- [x] static method `Router.url(path, params, [options])`
  - [x] `Router.url(path, ...paramStrings, [options])`
  - [x] `options.query`
- [x] `router.param(param, ...middlewares)` 
