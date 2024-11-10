<h1 align="center"> <code>express-rate-limit</code> </h1>

<div align="center">

[![tests](https://img.shields.io/github/actions/workflow/status/express-rate-limit/express-rate-limit/ci.yaml)](https://github.com/express-rate-limit/express-rate-limit/actions/workflows/ci.yaml)
[![npm version](https://img.shields.io/npm/v/express-rate-limit.svg)](https://npmjs.org/package/express-rate-limit 'View this project on NPM')
[![npm downloads](https://img.shields.io/npm/dm/express-rate-limit)](https://www.npmjs.com/package/express-rate-limit)
[![license](https://img.shields.io/npm/l/express-rate-limit)](license.md)

</div>

Basic rate-limiting middleware for [Express](http://expressjs.com/). Use to
limit repeated requests to public APIs and/or endpoints such as password reset.
Plays nice with
[express-slow-down](https://www.npmjs.com/package/express-slow-down) and
[ratelimit-header-parser](https://www.npmjs.com/package/ratelimit-header-parser).

## Usage

The [full documentation](https://express-rate-limit.mintlify.app/overview) is
available on-line.

```ts
import { rateLimit } from 'express-rate-limit'

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	// store: ... , // Redis, Memcached, etc. See below.
})

// Apply the rate limiting middleware to all requests.
app.use(limiter)
```

### Data Stores

The rate limiter comes with a built-in memory store, and supports a variety of
[external data stores](https://express-rate-limit.mintlify.app/reference/stores).

### Configuration

All function options may be async. Click the name for additional info and
default values.

| Option                                                                                                             | Type                             | Remarks                                                                                         |
| ------------------------------------------------------------------------------------------------------------------ | -------------------------------- | ----------------------------------------------------------------------------------------------- |
| [`windowMs`](https://express-rate-limit.mintlify.app/reference/configuration#windowms)                             | `number`                         | How long to remember requests for, in milliseconds.                                             |
| [`limit`](https://express-rate-limit.mintlify.app/reference/configuration#limit)                                   | `number` \| `function`           | How many requests to allow.                                                                     |
| [`message`](https://express-rate-limit.mintlify.app/reference/configuration#message)                               | `string` \| `json` \| `function` | Response to return after limit is reached.                                                      |
| [`statusCode`](https://express-rate-limit.mintlify.app/reference/configuration#statuscode)                         | `number`                         | HTTP status code after limit is reached (default is 429).                                       |
| [`legacyHeaders`](https://express-rate-limit.mintlify.app/reference/configuration#legacyheaders)                   | `boolean`                        | Enable the `X-Rate-Limit` header.                                                               |
| [`standardHeaders`](https://express-rate-limit.mintlify.app/reference/configuration#standardheaders)               | `'draft-6'` \| `'draft-7'`       | Enable the `Ratelimit` header.                                                                  |
| [`requestPropertyName`](https://express-rate-limit.mintlify.app/reference/configuration#requestpropertyname)       | `string`                         | Add rate limit info to the `req` object.                                                        |
| [`skipFailedRequests`](https://express-rate-limit.mintlify.app/reference/configuration#skipfailedrequests)         | `boolean`                        | Uncount 4xx/5xx responses.                                                                      |
| [`skipSuccessfulRequests`](https://express-rate-limit.mintlify.app/reference/configuration#skipsuccessfulrequests) | `boolean`                        | Uncount 1xx/2xx/3xx responses.                                                                  |
| [`keyGenerator`](https://express-rate-limit.mintlify.app/reference/configuration#keygenerator)                     | `function`                       | Identify users (defaults to IP address).                                                        |
| [`handler`](https://express-rate-limit.mintlify.app/reference/configuration#handler)                               | `function`                       | Function to run after limit is reached (overrides `message` and `statusCode` settings, if set). |
| [`skip`](https://express-rate-limit.mintlify.app/reference/configuration#skip)                                     | `function`                       | Return `true` to bypass the limiter for the given request.                                      |
| [`requestWasSuccessful`](https://express-rate-limit.mintlify.app/reference/configuration#requestwassuccessful)     | `function`                       | Used by `skipFailedRequests` and `skipSuccessfulRequests`.                                      |
| [`validate`](https://express-rate-limit.mintlify.app/reference/configuration#validate)                             | `boolean` \| `object`            | Enable or disable built-in validation checks.                                                   |
| [`store`](https://express-rate-limit.mintlify.app/reference/configuration#store)                                   | `Store`                          | Use a custom store to share hit counts across multiple nodes.                                   |

## Thank You

Sponsored by [Zuplo](https://zuplo.link/express-rate-limit) a fully-managed API
Gateway for developers. Add
[dynamic rate-limiting](https://zuplo.link/dynamic-rate-limiting),
authentication and more to any API in minutes. Learn more at
[zuplo.com](https://zuplo.link/express-rate-limit)

---

Thanks to Mintlify for hosting the documentation at
[express-rate-limit.mintlify.app](https://express-rate-limit.mintlify.app)

<p align="center">
	<a href="https://mintlify.com/?utm_campaign=devmark&utm_medium=readme&utm_source=express-rate-limit">
		<img height="75" src="https://devmark-public-assets.s3.us-west-2.amazonaws.com/sponsorships/mintlify.svg" alt="Create your docs today">
	</a>
</p>

---

Finally, thank you to everyone who's contributed to this project in any way! 🫶

## Issues and Contributing

If you encounter a bug or want to see something added/changed, please go ahead
and
[open an issue](https://github.com/nfriexpress-rate-limitedly/express-rate-limit/issues/new)!
If you need help with something, feel free to
[start a discussion](https://github.com/express-rate-limit/express-rate-limit/discussions/new)!

If you wish to contribute to the library, thanks! First, please read
[the contributing guide](https://express-rate-limit.mintlify.app/docs/guides/contributing.mdx).
Then you can pick up any issue and fix/implement it!

## License

MIT © [Nathan Friedly](http://nfriedly.com/),
[Vedant K](https://github.com/gamemaker1)
