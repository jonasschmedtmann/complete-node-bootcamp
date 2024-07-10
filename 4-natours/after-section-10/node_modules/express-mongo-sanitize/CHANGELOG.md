# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [1.3.2] - 2017-01-12
### Fixed
- Fixed an issue when using the sanitizer in the node REPL. #3

## [1.3.1] - 2017-01-12
### Fixed
- Fixed an issue with objects containing prohibited keys nested inside other objects with prohibited keys. #2
- Added a more robust check for plain objects.

## [1.3.0] - 2016-01-15
### Added
- A new function `has`, which checks whether a passed object/array contains any keys with prohibited characters.

## [1.2.0] - 2016-01-13
### Added
- A new option `replaceWith` which can be used to replace offending characters in a key. This is an alternative to removing the data from the payload.

## [1.1.0] - 2016-01-13
### Added
- The middleware also now sanitizes keys with a `.`. This is in line with Mongo's reserved operators.

## 1.0.0 - 2015-11-11

Initial Release.

[1.3.2]: https://github.com/fiznool/express-mongo-sanitize/compare/v1.3.1...v1.3.2
[1.3.1]: https://github.com/fiznool/express-mongo-sanitize/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/fiznool/express-mongo-sanitize/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/fiznool/express-mongo-sanitize/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/fiznool/express-mongo-sanitize/compare/v1.0.0...v1.1.0
