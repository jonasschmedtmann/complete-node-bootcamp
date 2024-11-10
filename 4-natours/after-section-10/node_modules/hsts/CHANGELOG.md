# Changelog

## 2.2.0
### Added
* Created a changelog

### Changed
* Mark the module as Node 4+ in the `engines` field of `package.json`
* Add a `homepage` in `package.json`
* Add an email to `package.json`'s `bugs` field
* Updated documentation
* Updated Adam Baldwin's contact info. See [helmetjs/helmet#189](https://github.com/helmetjs/helmet/issues/189)

### Deprecated
* The `setIf` option has been deprecated and will be removed in `hsts@3`. Refer to the documentation to see how to do without it. See [#22](https://github.com/helmetjs/hsts/issues/22) for more
* The `includeSubdomains` option (with a lowercase `d`) has been deprecated and will be removed in `hsts@3`. Use the uppercase-D `includeSubDomains` option instead. See [#21](https://github.com/helmetjs/hsts/issues/21) for more

Changes in versions 2.1.0 and below can be found in [Helmet's changelog](https://github.com/helmetjs/helmet/blob/master/CHANGELOG.md).
