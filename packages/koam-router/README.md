# Koam-router

Implement a simple Koa-like router to create a web application.

THIS FRAMEWORK HAVE NOT BEEN STRICTLY TESTED, PLEASE DO NOT USE IT IN PRODUCTION !  
许多功能未经严格测试，请勿用于生产目的！

## Usage

```ts
import Router from '@mutoe/koam-router'

const router = new Router()

app.use(router.routes())
```


## Roadmap

Options

- [ ] `prefix`
- [ ] `exclusive`
- [ ] `host`

Router

- [ ] `router.get([name], path, ...middlewares)`
- [ ] `router.post([name], path, ...middlewares)`
- [ ] `router.put([name], path, ...middlewares)`
- [ ] `router.patch([name], path, ...middlewares)`
- [ ] `router.delete([name], path, ...middlewares)`
- [ ] `router.all([name], path, ...middlewares)`
- [ ] `context.params`
- [ ] `router.routes()`
- [ ] `router.use([path], middleware)`
- [ ] `router.use(path, anotherRouter.routes())`
- [ ] `router.prefix(path)`
- [ ] `router.allowedMethods([options])`
  - [ ] `options.throw`
  - [ ] `options.notImplemented`
  - [ ] `options.methodNotAllowed`
- [ ] `router.redirect(source, destination, [status])`
- [ ] `router.route(name)`
- [ ] `router.url(name, params, [options])`
  - [ ] `options.query`
- [ ] `router.param(param, middleware)`

Static methods

- [ ] `Router.url(path, params)`
