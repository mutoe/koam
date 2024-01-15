# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.2.0](https://github.com/mutoe/koam/compare/v2.1.0...v2.2.0) (2024-01-15)


### Features

* support custom body parser ([f3a759c](https://github.com/mutoe/koam/commit/f3a759c226beb90a5c98f0b50ac14297e2adaad9))





# [2.1.0](https://github.com/mutoe/koam/compare/v2.0.2...v2.1.0) (2023-08-08)


### Bug Fixes

* **core:** fix `ctx.url` have extra trailing question mark when path and querystring is emtpy ([afc7ea5](https://github.com/mutoe/koam/commit/afc7ea581cd3e18d45fb6f2088f7eaaa7e5e1471))





## [2.0.2](https://github.com/mutoe/koam/compare/v2.0.1...v2.0.2) (2023-07-25)


### Bug Fixes

* cannot process multiple request at the same time issue ([acf97fb](https://github.com/mutoe/koam/commit/acf97fbdeb7a18184a5ad98b2bf47b6a08b46524))





# [2.0.0-alpha.0](https://github.com/mutoe/koam/compare/v1.1.1...v2.0.0-alpha.0) (2023-06-09)

**Note:** Version bump only for package @mutoe/koam-core





## [1.1.1](https://github.com/mutoe/koam/compare/v1.1.0...v1.1.1) (2023-06-08)


### Bug Fixes

* **koam:** should not rewrite response content type when set body ([b0e4bf7](https://github.com/mutoe/koam/commit/b0e4bf73bbc8091ba104c51bd7ff4cd6079091b4))





# [1.1.0](https://github.com/mutoe/koam/compare/v1.0.1...v1.1.0) (2023-06-08)


### Features

* **koam:** inside koa connect middleware ([b42121c](https://github.com/mutoe/koam/commit/b42121cb46936e602a869295b2ab8ada0182533c))





# [1.0.0](https://github.com/mutoe/koam/compare/v0.3.2...v1.0.0) (2023-06-01)


### Bug Fixes

* **koam:** do not update response status after manual assigned when redirect ([ad95673](https://github.com/mutoe/koam/commit/ad9567327a23a28f4c27bc4b916bd75cc51e8b2f))
* **koam:** fix useless state property ([99ef7a5](https://github.com/mutoe/koam/commit/99ef7a5c6c9827b034a84ce40bcf9b4e9f211503))
* **koam:** should return correct status when body is different ([59782c2](https://github.com/mutoe/koam/commit/59782c2ecfa9c437fd0905ec6f0ab1c7dfc0992a))
* path resolve issue ([949a18e](https://github.com/mutoe/koam/commit/949a18e55aa120af1593546c451f0953462e39a0))


### Features

* **koam:** add more 3xx http status ([90b4349](https://github.com/mutoe/koam/commit/90b434909648ed3e934b8b5f92ad4695e034a893))
* **koam:** export Koa namespace to override ([31f3c62](https://github.com/mutoe/koam/commit/31f3c62810dfad4f75d6d7d9386a43d743980198))
* **koam:** support ctx.attachment method ([6eec41c](https://github.com/mutoe/koam/commit/6eec41cd5c7b56feef2a5d4453b49eeaccb0f3bb))
* support context.length ([2a420a1](https://github.com/mutoe/koam/commit/2a420a14d7ee6f706efcd2f5ccaf70801b425b68))
* support stream as response body ([4a62eca](https://github.com/mutoe/koam/commit/4a62eca39d7e467c22fd8cf5ec31cac1273d3d16))





## [0.3.2](https://github.com/mutoe/koam/compare/v0.3.1...v0.3.2) (2023-05-17)


### Bug Fixes

* assert function using issue ([90960a4](https://github.com/mutoe/koam/commit/90960a443f4cc772dce34cca50f4aedf1768c5b6))





## [0.3.1](https://github.com/mutoe/koam/compare/v0.3.0...v0.3.1) (2023-05-16)


### Bug Fixes

* cannot using external lib issue ([4bd4d03](https://github.com/mutoe/koam/commit/4bd4d032896e9616d6559c3ad5ca50445bf41c8d))





# [0.3.0](https://github.com/mutoe/koam/compare/v0.2.4...v0.3.0) (2023-05-16)


### Bug Fixes

* path issue after upgrade ts and eslint ([06a8c3d](https://github.com/mutoe/koam/commit/06a8c3dc962e66c61ce44f27e8a6129bd9e3e445))





## [0.2.4](https://github.com/mutoe/koam/compare/v0.2.3...v0.2.4) (2023-05-05)


### Bug Fixes

* entrypoint for esm ([eaaed98](https://github.com/mutoe/koam/commit/eaaed98eff9717cb2d2b462099f5edb233d02a32))





## [0.2.3](https://github.com/mutoe/koam/compare/v0.2.2...v0.2.3) (2023-05-05)


### Bug Fixes

* entrypoint for esm ([dbe1d90](https://github.com/mutoe/koam/commit/dbe1d9098b3cc1bc53b85210e9b85e43135a1792))





## [0.2.2](https://github.com/mutoe/koam/compare/v0.2.1...v0.2.2) (2023-05-05)


### Bug Fixes

* entrypoint for esm ([da07d83](https://github.com/mutoe/koam/commit/da07d832bb58de824699295aaedb62770f5cabb5))





## [0.2.1](https://github.com/mutoe/koam/compare/v0.2.0...v0.2.1) (2023-05-05)


### Bug Fixes

* node module has no default export issue ([b9946c9](https://github.com/mutoe/koam/commit/b9946c9534d307cbb19238fd96c7f50992617e3e))





# [0.2.0](https://github.com/mutoe/koam/compare/v0.1.4...v0.2.0) (2023-05-05)


### Bug Fixes

* set verbatimModuleSyntax to true for swc project ([ee04cd4](https://github.com/mutoe/koam/commit/ee04cd4a6641330897664cf982151a4af99a9253))





## [0.1.3](https://github.com/mutoe/koam/compare/v0.1.2...v0.1.3) (2023-05-05)


### Bug Fixes

* released package does not have type declaration issue ([bd10d00](https://github.com/mutoe/koam/commit/bd10d005703b6e7433af487cde93078424e0ff99))





## [0.1.2](https://github.com/mutoe/koam/compare/v0.1.1...v0.1.2) (2022-11-07)

**Note:** Version bump only for package @mutoe/koam





## [0.1.1](https://github.com/mutoe/koam/compare/v0.1.0...v0.1.1) (2022-11-07)

**Note:** Version bump only for package @mutoe/koam





# 0.1.0 (2022-11-07)

**Note:** Version bump only for package @mutoe/koam
