# HPP

[Express](http://expressjs.com) middleware to **protect against HTTP Parameter Pollution attacks**

[![Build Status](https://travis-ci.org/analog-nico/hpp.svg?branch=master)](https://travis-ci.org/analog-nico/hpp) [![Coverage Status](https://coveralls.io/repos/analog-nico/hpp/badge.png)](https://coveralls.io/r/analog-nico/hpp?branch=master) [![Dependency Status](https://david-dm.org/analog-nico/hpp.svg)](https://david-dm.org/analog-nico/hpp)

## Why?

Let [Chetan Karande's slides](https://speakerdeck.com/ckarande/top-overlooked-security-threats-to-node-dot-js-web-applications?slide=48) do the explaining:

[![Slide 48](img/slide48.jpg)](https://speakerdeck.com/ckarande/top-overlooked-security-threats-to-node-dot-js-web-applications?slide=48)
[![Slide 49](img/slide49.jpg)](https://speakerdeck.com/ckarande/top-overlooked-security-threats-to-node-dot-js-web-applications?slide=49)
[![Slide 50](img/slide50.jpg)](https://speakerdeck.com/ckarande/top-overlooked-security-threats-to-node-dot-js-web-applications?slide=50)
[![Slide 54](img/slide54.jpg)](https://speakerdeck.com/ckarande/top-overlooked-security-threats-to-node-dot-js-web-applications?slide=54)

...and exploits may allow [bypassing the input validation](https://speakerdeck.com/ckarande/top-overlooked-security-threats-to-node-dot-js-web-applications?slide=57) or even result in [denial of service](https://speakerdeck.com/ckarande/top-overlooked-security-threats-to-node-dot-js-web-applications?slide=55).

## And HPP solves this how exactly?

HPP puts array parameters in `req.query` and/or `req.body` aside and just selects the last parameter value. You add the middleware and you are done.

## Installation

[![NPM Stats](https://nodei.co/npm/hpp.png?downloads=true)](https://npmjs.org/package/hpp)

This is a module for node.js and io.js and is installed via npm:

``` bash
npm install hpp --save
```

## Getting Started

Add the HPP middleware like this:

``` js
// ...
var hpp = require('hpp');

// ...
app.use(bodyParser.urlencoded()); // Make sure the body is parsed beforehand.

app.use(hpp()); // <- THIS IS THE NEW LINE

// Add your own middlewares afterwards, e.g.:
app.get('/search', function (req, res, next) { /* ... */ });
// They are safe from HTTP Parameter Pollution now.
```

## Details about `req.query`

By default all top-level parameters in `req.query` are checked for being an array. If a parameter is an array the array is moved to `req.queryPolluted` and `req.query` is assigned the last value of the array:

```
GET /search?firstname=John&firstname=Alice&lastname=Doe

=>

req: {
    query: {
        firstname: 'Alice',
        lastname: 'Doe',
    },
    queryPolluted: {
        firstname: [ 'John', 'Alice' ]
    }
}
```

Checking `req.query` may be turned off by using `app.use(hpp({ checkQuery: false }))`.

## Details about `req.body`

**Checking `req.body` is only done for requests with an urlencoded body. Not for json nor multipart bodies.**

By default all top-level parameters in `req.body` are checked for being an array. If a parameter is an array the array is moved to `req.bodyPolluted` and `req.body` is assigned the last value of the array:

```
POST firstname=John&firstname=Alice&lastname=Doe

=>

req: {
    body: {
        firstname: 'Alice',
        lastname: 'Doe',
    },
    bodyPolluted: {
        firstname: [ 'John', 'Alice' ]
    }
}
```

Checking `req.body` may be turned off by using `app.use(hpp({ checkBody: false }))`.

## Whitelisting Specific Parameters

The `whitelist` option allows to specify parameters that shall not be touched by HPP. Usually specific parameters of a certain route are intentionally used as arrays. For that use the following approach that involves multiple HPP middlewares:

``` js
// Secure all routes at first.
// You could add separate HPP middlewares to each route individually but the day will come when you forget to secure a new route.
app.use(hpp());

// Add a second HPP middleware to apply the whitelist only to this route.
app.use('/search', hpp({ whitelist: [ 'filter' ] }));
```

```
GET /search?package=Helmet&package=HPP&filter=nodejs&filter=iojs

=>

req: {
    query: {
        package: 'HPP',
        filter:  [ 'nodejs', 'iojs' ], // Still an array
    },
    queryPolluted: {
        package: [ 'Helmet', 'HPP' ]
    }
}
```

The whitelist works for both `req.query` and `req.body`.

## Performance

HPP was written with performance in mind since it eats CPU cycles for each request.

A [performance test](test/spec/perf.js) that includes two HPP middlewares plus a whitelist simulates an already demanding use case. On my Mac Book Air it measures **0.002ms to process a single request**.

## Contributing

To set up your development environment for HPP:

1. Clone this repo to your desktop,
2. in the shell `cd` to the main folder,
3. hit `npm install`,
4. hit `npm install gulp -g` if you haven't installed gulp globally yet, and
5. run `gulp dev`. (Or run `node ./node_modules/.bin/gulp dev` if you don't want to install gulp globally.)

`gulp dev` watches all source files and if you save some changes it will lint the code and execute all tests. The test coverage report can be viewed from `./coverage/lcov-report/index.html`.

If you want to debug a test you should use `gulp test-without-coverage` to run all tests without obscuring the code by the test coverage instrumentation.

## Change History

- v0.2.3 (2020-01-07)
    - Updated lodash dependency because of vulnerability
    - Added node v6, v8, v10 to CI build
    - Removed node v5 from CI build
- v0.2.2 (2017-04-11)
    - Requiring individual lodash functions for faster boot time and lower memory footprint
      *(Thanks to @mschipperheyn for suggesting this in [issue #6](https://github.com/analog-nico/hpp/issues/6))*
- v0.2.1 (2016-04-03)
    - Added node v4 and v5 to CI build
    - Removed node v0.11 from CI build
    - Updated dependencies
- v0.2.0 (2015-05-25)
    - Bumped version to 0.2 to properly follow semver since the whitelist was added in v0.1.2
    - For better intuitiveness the last instead of the first value of an array is selected 
    - Refactoring to improve readability and performance
      *(Thanks to @le0nik for [pull request #2](https://github.com/analog-nico/hpp/pull/2))*
    - Updated dependencies
      *(Thanks to @maxrimue for [pull request #3](https://github.com/analog-nico/hpp/pull/3))*
- v0.1.2 (2015-05-18)
    - Added [whitelist feature](#whitelisting-specific-parameters)
      *(Thanks to @avaly for suggesting this in [issue #1](https://github.com/analog-nico/hpp/issues/1))*
	- Updated dependencies
- v0.1.1 (2015-04-16)
    - Removed two closures
    - Updated lodash
- v0.1.0 (2015-04-12)
    - Updated dependencies
    - Use in production satisfactory
- v0.0.1 (2015-03-05)
    - Initial version

## License (ISC)

In case you never heard about the [ISC license](http://en.wikipedia.org/wiki/ISC_license) it is functionally equivalent to the MIT license.

See the [LICENSE file](LICENSE) for details.
