# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.1.1](https://github.com/mutoe/koam/compare/v1.1.0...v1.1.1) (2023-06-08)

**Note:** Version bump only for package @mutoe/koam-router





# [1.1.0](https://github.com/mutoe/koam/compare/v1.0.1...v1.1.0) (2023-06-08)

**Note:** Version bump only for package @mutoe/koam-router





## [1.0.1](https://github.com/mutoe/koam/compare/v1.0.0...v1.0.1) (2023-06-01)


### Bug Fixes

* **router:** mark peer dependency koam require ^1.0.0 ([8216bf9](https://github.com/mutoe/koam/commit/8216bf991d5f251c785463d05a7ba3df3314ec96))





# [1.0.0](https://github.com/mutoe/koam/compare/v0.3.2...v1.0.0) (2023-06-01)


### Bug Fixes

* path resolve issue ([949a18e](https://github.com/mutoe/koam/commit/949a18e55aa120af1593546c451f0953462e39a0))
* **router:** fix unnamed modifiers path match ([70ecd50](https://github.com/mutoe/koam/commit/70ecd50015715dfa8c2ccf3d09817522f4ee65e4))
* **router:** recovery allowedMethods feature after refactor ([f227963](https://github.com/mutoe/koam/commit/f227963be3357656ec30936811f3ccf944ced460))
* **router:** recovery prefix feature after refactor ([335fea3](https://github.com/mutoe/koam/commit/335fea36807c5d635d076768798a540cbdcfe756))
* **router:** recovery router.param method ([3d0422b](https://github.com/mutoe/koam/commit/3d0422b35b9a95887b4ede064b53d7bec22da2c9))
* **router:** recovery router.use feature after refactor ([b487c79](https://github.com/mutoe/koam/commit/b487c7951af019589aa0dba38807de6ec662759d))
* **router:** should match correct route when multiple declare different method routes ([194585b](https://github.com/mutoe/koam/commit/194585bedc9751903e55598493f92c4939fe11e9))
* **router:** should rewrite the previous named route when redeclare named route ([98a84e5](https://github.com/mutoe/koam/commit/98a84e51c38ee6c4a6a97e454476dce2595b61b9))


### Features

* implement basic router match method ([a8c3575](https://github.com/mutoe/koam/commit/a8c3575e71f935e0d408fa1ecce87c44d41a9b62))
* implement context parameters ([38574b5](https://github.com/mutoe/koam/commit/38574b5648a4323dee2105a72fee7401f5a78000))
* refine path-regexp method ([1b9e058](https://github.com/mutoe/koam/commit/1b9e058bd1f80a6c5a97e2f6d4272727a586c1cf))
* **router:** implement basic router.allowedMethods ([986effb](https://github.com/mutoe/koam/commit/986effbf8080ef79f68f768769a6aa796f12decb))
* **router:** implement basic url method ([2e912d5](https://github.com/mutoe/koam/commit/2e912d510c28a43c61aa70a52d058104d8d6fcbf))
* **router:** implement context params ([d86bb83](https://github.com/mutoe/koam/commit/d86bb8356c26320cef647e3bf15f4b5c569c70b7))
* **router:** implement nested routers ([d1464ad](https://github.com/mutoe/koam/commit/d1464adecc62a0ded6afbb6197a114470f5e9a36))
* **router:** implement router.param method ([89ff859](https://github.com/mutoe/koam/commit/89ff8592af1709f8080d2571ebb42de0942ee0eb))
* **router:** implement router.prefix ([a3206b4](https://github.com/mutoe/koam/commit/a3206b4ae7d2afb7291a5d40520235ffec08f3b3))
* **router:** implement router.redirect method ([1a068b6](https://github.com/mutoe/koam/commit/1a068b60369afba717d3eb989eee902c7baa73cc))
* **router:** implement router.use method ([779771b](https://github.com/mutoe/koam/commit/779771b7e8d91052cb772dbb3760d0e2a9e88ace))
* **router:** path match support standalone modifier '*' and '+' ([7656683](https://github.com/mutoe/koam/commit/765668334b891e28e2d2ec7139344cb1c349f7df))
* **router:** support constructor prefix argument ([6c70bce](https://github.com/mutoe/koam/commit/6c70bce8375e5b3147f57df8715511b970911084))
* **router:** support router params list when call url method ([b91f4d6](https://github.com/mutoe/koam/commit/b91f4d6de50eb6cd31bfba6127a80e35367573c8))
* **router:** support use array path ([fb06153](https://github.com/mutoe/koam/commit/fb06153cac74a4cc12f5ea470664adf500f4e5ca))
* **router:** url method support pass in query parameter ([2045cb7](https://github.com/mutoe/koam/commit/2045cb784ff5800e07b2c7b6db59793aa45d8751))
* support basic router path match ([ec6e797](https://github.com/mutoe/koam/commit/ec6e797cdc02c5d81751a917333e1dac9f5b9af6))





## [0.3.2](https://github.com/mutoe/koam/compare/v0.3.1...v0.3.2) (2023-05-17)

**Note:** Version bump only for package @mutoe/koam-router





## [0.3.1](https://github.com/mutoe/koam/compare/v0.3.0...v0.3.1) (2023-05-16)


### Bug Fixes

* cannot using external lib issue ([4bd4d03](https://github.com/mutoe/koam/commit/4bd4d032896e9616d6559c3ad5ca50445bf41c8d))





# [0.3.0](https://github.com/mutoe/koam/compare/v0.2.4...v0.3.0) (2023-05-16)


### Bug Fixes

* path issue after upgrade ts and eslint ([06a8c3d](https://github.com/mutoe/koam/commit/06a8c3dc962e66c61ce44f27e8a6129bd9e3e445))


### Features

* **router:** add basic path-to-regexp util function ([7312da0](https://github.com/mutoe/koam/commit/7312da0c12009c3ac51ac96578cd299607ccff6c))
* **router:** add basic path-to-regexp util function ([6705c40](https://github.com/mutoe/koam/commit/6705c40742e29dbfd6279b21f240ac67a8813b2c))
* **router:** implement asterisk and plus sign in path regexp ([6440fca](https://github.com/mutoe/koam/commit/6440fca85c2389dff795c5b9ea1b06d976edb09d))





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

**Note:** Version bump only for package @mutoe/koam-router





# [0.2.0](https://github.com/mutoe/koam/compare/v0.1.4...v0.2.0) (2023-05-05)


### Bug Fixes

* set verbatimModuleSyntax to true for swc project ([ee04cd4](https://github.com/mutoe/koam/commit/ee04cd4a6641330897664cf982151a4af99a9253))





## [0.1.4](https://github.com/mutoe/koam/compare/v0.1.3...v0.1.4) (2023-05-05)


### Bug Fixes

* koam router cannot publish issue ([b8f1fe2](https://github.com/mutoe/koam/commit/b8f1fe204394c479f44790c03bd8403573a10214))





## [0.1.3](https://github.com/mutoe/koam/compare/v0.1.2...v0.1.3) (2023-05-05)


### Features

* **router:** add http verb methods ([25dff24](https://github.com/mutoe/koam/commit/25dff241864993f60c9424aff580621b352748f8))
