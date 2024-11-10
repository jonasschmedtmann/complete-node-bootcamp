# Express Mongoose Sanitize

Express 4.x middleware which sanitizes user-supplied data to prevent MongoDB Operator Injection.

[![Build Status](https://travis-ci.org/fiznool/express-mongo-sanitize.svg?branch=master)](https://travis-ci.org/fiznool/express-mongo-sanitize)
[![npm version](https://badge.fury.io/js/express-mongo-sanitize.svg)](http://badge.fury.io/js/express-mongo-sanitize)
[![Dependency Status](https://david-dm.org/fiznool/express-mongo-sanitize.svg)](https://david-dm.org/fiznool/express-mongo-sanitize)
[![devDependency Status](https://david-dm.org/fiznool/express-mongo-sanitize/dev-status.svg)](https://david-dm.org/fiznool/express-mongo-sanitize#info=devDependencies)


## Installation

``` bash
npm install express-mongo-sanitize
```

## Usage

Add as a piece of express middleware, before defining your routes.

``` js
var express = require('express'),
    bodyParser = require('body-parser'),
    mongoSanitize = require('express-mongo-sanitize');

var app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// To remove data, use:
app.use(mongoSanitize());

// Or, to replace prohibited characters with _, use:
app.use(mongoSanitize({
  replaceWith: '_'
}))

```

You can also bypass the middleware and use the module directly:

``` js
var mongoSanitize = require('express-mongo-sanitize');

var payload = {...};

// Remove any keys containing prohibited characters
mongoSanitize.sanitize(payload);

// Replace any prohibited characters in keys
mongoSanitize.sanitize(payload, {
  replaceWith: '_'
});

// Check if the payload has keys with prohibited characters
var hasProhibited = mongoSanitize.has(payload);
```

## What?

This module searches for any keys in objects that begin with a `$` sign or contain a `.`, from `req.body`, `req.query` or `req.params`. It can then either:

- completely remove these keys and associated data from the object, or
- replace the prohibited characters with another allowed character.

The behaviour is governed by the passed option, `replaceWith`. Set this option to have the sanitizer replace the prohibited characters with the character passed in.

See the spec file for more examples.

## Why?

Object keys starting with a `$` or containing a `.` are _reserved_ for use by MongoDB as operators. Without this sanitization,  malicious users could send an object containing a `$` operator, or including a `.`, which could change the context of a database operation. Most notorious is the `$where` operator, which can execute arbitrary JavaScript on the database.

The best way to prevent this is to sanitize the received data, and remove any offending keys, or replace the characters with a 'safe' one.

## Credits

Inspired by [mongo-sanitize](https://github.com/vkarpov15/mongo-sanitize).

## License

MIT
