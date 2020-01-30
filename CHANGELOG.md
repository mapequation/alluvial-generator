# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.4.5](https://github.com/mapequation/alluvial-generator/compare/v0.4.4...v0.4.5) (2020-01-30)


### Features

* Paint modules with matching module ids in all networks ([0c6d236](https://github.com/mapequation/alluvial-generator/commit/0c6d2365a1c4a736527e334b3ff07be42772b49d))

### [0.4.4](https://github.com/mapequation/alluvial-generator/compare/v0.4.3...v0.4.4) (2020-01-15)


### Features

* Display highlighted streamlines on top ([0e42d28](https://github.com/mapequation/alluvial-generator/commit/0e42d287c7fb3bff166313214fcd9672bdcf4fba))


### Bug Fixes

* Add core-js for supporting older browsers ([ae9c4db](https://github.com/mapequation/alluvial-generator/commit/ae9c4db7a0da412de21b0483f3a35aa9d09559de))

### [0.4.3](https://github.com/mapequation/alluvial-generator/compare/v0.4.2...v0.4.3) (2020-01-07)


### Features

* Simple way to highlight individual nodes ([56e4778](https://github.com/mapequation/alluvial-generator/commit/56e47782d65c2d495adb0e30cb14ea1c4eba2d3b))


### Bug Fixes

* Selected module info table inputs should never be null. ([12c13ab](https://github.com/mapequation/alluvial-generator/commit/12c13ab4b1dd367cbb4014a3f5264173fe5d3179))

### [0.4.2](https://github.com/mapequation/alluvial-generator/compare/v0.4.1...v0.4.2) (2019-12-27)


### Bug Fixes

* Removed extra characters for target StreamlineNode in createId ([203cda5](https://github.com/mapequation/alluvial-generator/commit/203cda558c25a5409300f6d83115d4401ab4728f))
* Sort streamlines as long as the opposite module is above threshold ([3af1ccd](https://github.com/mapequation/alluvial-generator/commit/3af1ccd314d5629b56d33ad85aaca9140f4de1b7))

### [0.4.1](https://github.com/mapequation/alluvial-generator/compare/v0.4.0...v0.4.1) (2019-12-16)


### Bug Fixes

* Mouseover on streamlines should highlight the connected groups ([b5ef52c](https://github.com/mapequation/alluvial-generator/commit/b5ef52cb2a8562ae807f04ae402d4a6c9582ec39))
* Remove LeafNodes from opposite node if the NetworkRoot is removed ([d927619](https://github.com/mapequation/alluvial-generator/commit/d927619f1b054778de493b9e8621da5e50e09df9))

## [0.4.0](https://github.com/mapequation/alluvial-generator/compare/v0.3.3...v0.4.0) (2019-12-04)


### ⚠ BREAKING CHANGES

* Internal API has changed

### Bug Fixes

* Silence proptypes warnings for changelog ([db590e1](https://github.com/mapequation/alluvial-generator/commit/db590e159769614cb66a03b5b46023541194e067))


* API refactor to separate interface vs internal structure ([19874a9](https://github.com/mapequation/alluvial-generator/commit/19874a9b20d109a77caecc10af02de3a87ccf4d6))

### [0.3.3](https://github.com/mapequation/alluvial-generator/compare/v0.3.2...v0.3.3) (2019-12-02)


### Features

* Support significance information in stree files ([5374352](https://github.com/mapequation/alluvial-generator/commit/5374352c283c6ef74bfe96a896531b2deb2e6de7))


### Bug Fixes

* Streamlines could be misaligned for small modules. ([593770d](https://github.com/mapequation/alluvial-generator/commit/593770d2b12ced277d22d6fa16b97c0d66bd6620))

### 0.3.2 (2019-11-24)


### Features

* Include module filters when saving diagram ([175a9d9](https://github.com/mapequation/alluvial-generator/commit/175a9d9ce26a36356d4cfb97c7502e628b7cb337))


### Bug Fixes

* Clear filter when expanding or contracting modules ([789bb14](https://github.com/mapequation/alluvial-generator/commit/789bb14414ece974f30b6fa2beb1bb67b378918f))
