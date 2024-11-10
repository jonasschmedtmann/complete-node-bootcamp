# Changelog

## 2.10.0 - 2020-03-24
### Added
- Add support for the `allow-downloads` sandbox directive. See [#103](https://github.com/helmetjs/csp/pull/103)

## 2.9.5 - 2020-02-22
### Changed
- Updated `bowser` subdependency from 2.7.0 to 2.9.0

### Fixed
- Fixed an issue some people were having when importing the `bowser` subdependency. See [#96](https://github.com/helmetjs/csp/issues/96) and [#101](https://github.com/helmetjs/csp/pull/101)
- Fixed a link in the readme. See [#100](https://github.com/helmetjs/csp/pull/100)

## 2.9.4 - 2019-10-21
### Changed
- Updated `bowser` subdependency from 2.6.1 to 2.7.0. See [#94](https://github.com/helmetjs/csp/pull/94)

## 2.9.3 - 2019-09-30
### Fixed
- Published a missing TypeScript type definition file. See [#90](https://github.com/helmetjs/csp/issues/90)

## 2.9.2 - 2019-09-20
### Fixed
- Fixed a bug where a request from Firefox 4 could delete `default-src` from future responses
- Fixed tablet PC detection by updating `bowser` subdependency to latest version

## 2.9.1 - 2019-09-04
### Changed
- Updated `bowser` subdependency from 2.5.3 to 2.5.4. See [#88](https://github.com/helmetjs/csp/pull/88)

### Fixed
- The "security" keyword was declared twice in package metadata. See [#87](https://github.com/helmetjs/csp/pull/87)

## 2.9.0 - 2019-08-28
### Added
- Added TypeScript type definitions. See [#86](https://github.com/helmetjs/csp/pull/86)

### Fixed
- Switched from `platform` to `bowser` to quiet a security vulnerability warning. See [#80](https://github.com/helmetjs/csp/issues/80)

## 2.8.0 - 2019-07-24
### Added
- Added a new `sandbox` directive, `allow-downloads-without-user-activation` (see [#85](https://github.com/helmetjs/csp/pull/85))
- Created a changelog
- Added some package metadata

### Changed
- Updated documentation to use ES2015
- Updated documentation to remove dependency on UUID package
- Updated `content-security-policy-builder` to 2.1.0
- Excluded some files from the npm package

Changes in versions 2.7.1 and below can be found in [Helmet's changelog](https://github.com/helmetjs/helmet/blob/master/CHANGELOG.md).
