const Koa = require('@mutoe/koam-core')

module.exports = Koa

module.exports.Router = require('@mutoe/koam-router').default

module.exports.default = Koa
Object.assign(module.exports, require('@mutoe/koam-core'))
Object.assign(module.exports, require('@mutoe/koam-logger'))
Object.assign(module.exports, require('@mutoe/koam-router'))
