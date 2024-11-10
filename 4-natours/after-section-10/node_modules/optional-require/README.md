[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url]
[![Dependency Status][daviddm-image]][daviddm-url] [![devDependency Status][daviddm-dev-image]][daviddm-dev-url]

# Optional Require

NodeJS Require that let you handle module not found error without try/catch.  Allows you to gracefully require a module only if it exists and contains no error.

# Usage

```js
const optionalRequire = require("optional-require")(require);

const foo = optionalRequire("foo") || {};
const bar = optionalRequire("bar", true); // true enables console.log a message when not found
const xyz = optionalRequire("xyz", "test"); // "test" enables console.log a message with "test" added.
const fbPath = optionalRequire.resolve("foo", "foo doesn't exist");
const rel = optionalRequire("../foo/bar"); // relative module path works
```

# Install

```bash
$ npm i optional-require --save
```

# API

#### [optionalRequire(require)](#optionalrequirerequire)

The single function this module exports.  Call it with `require` to get a custom function for you to do optional require from your file's require context.  See [Usage](#usage) above.

#### [customOptionalRequire(path, \[message|options\])](#customoptionalrequirepath-messageoptions)

The function [optionalRequire](#optionalrequirerequire) returns for you to do optional require from your file's require context.

##### Params

-   `path` - name/path to the module your want to optionally require
-   `message` - optional flag/message to enable `console.log` a message when module is not found
-   `options` - an optional object with the following fields
    -   `message` - see above
    -   `fail` - callback for when an error that's _not_ `MODULE_NOT_FOUND` for `path` occurred
    -   `notFound` - callback for when `path` was not found
        -   The value from this is returned
    -   `default` - default value to returned when not found - not allowed with `notFound` together

##### Returns

-   module required or one of the following if not found
    -   `undefined` or
    -   return value from `options.notFound` if it's specified
    -   `options.default` if it's specified

##### Throws

-   rethrows any error that's not `MODULE_NOT_FOUND` for the module `path`

#### [customOptionalRequire.resolve(path, \[message\])](#customoptionalrequireresolvepath-message)

Same as [customOptionalRequire](#customoptionalrequirepath-messageoptions) but acts like `require.resolve`

#### [optionalRequire.log(message, path)](#optionalrequirelogmessage-path)

The function that will be called to log the message when optional module is not found.  You can override this with your own function.

#### [optionalRequire.try(require, path, \[message|options\])](#optionalrequiretryrequire-path-messageoptions)

Same as [customOptionalRequire](#customoptionalrequirepath-messageoptions) but you have to pass in `require` from your file's context.

#### [optionalRequire.resolve(require, path, \[message|options\])](#optionalrequireresolverequire-path-messageoptions)

Same as [customOptionalRequire.resolve](#customoptionalrequirepath-messageoptions) but you have to pass in `require` from your file's context.

# LICENSE

Apache-2.0 © [Joel Chen](https://github.com/jchip)

[travis-image]: https://travis-ci.org/jchip/optional-require.svg?branch=master

[travis-url]: https://travis-ci.org/jchip/optional-require

[npm-image]: https://badge.fury.io/js/optional-require.svg

[npm-url]: https://npmjs.org/package/optional-require

[daviddm-image]: https://david-dm.org/jchip/optional-require/status.svg

[daviddm-url]: https://david-dm.org/jchip/optional-require

[daviddm-dev-image]: https://david-dm.org/jchip/optional-require/dev-status.svg

[daviddm-dev-url]: https://david-dm.org/jchip/optional-require?type=dev
