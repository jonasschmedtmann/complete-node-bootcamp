<h1 align="center"> <code>express-rate-limit</code> </h1>

<div align="center">

[![tests](https://img.shields.io/github/actions/workflow/status/express-rate-limit/express-rate-limit/ci.yaml)](https://github.com/express-rate-limit/express-rate-limit/actions/workflows/ci.yaml)
[![npm version](https://img.shields.io/npm/v/express-rate-limit.svg)](https://npmjs.org/package/express-rate-limit 'View this project on NPM')
[![npm downloads](https://img.shields.io/npm/dm/express-rate-limit)](https://www.npmjs.com/package/express-rate-limit)
[![license](https://img.shields.io/npm/l/express-rate-limit)](license.md)

</div>

---

Sponsored by [Zuplo](https://zuplo.link/express-rate-limit) a fully-managed API
Gateway for developers. Add
[dynamic rate-limiting](https://zuplo.link/dynamic-rate-limiting),
authentication and more to any API in minutes. Learn more at
[zuplo.com](https://zuplo.link/express-rate-limit)

---

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
	// store: ... , // Use an external store for consistency across multiple server instances.
})

// Apply the rate limiting middleware to all requests.
app.use(limiter)
```

---

Thanks to Mintlify for hosting the documentation at
[express-rate-limit.mintlify.app](https://express-rate-limit.mintlify.app)

<p align="center">
	<a href="https://mintlify.com/?utm_campaign=devmark&utm_medium=readme&utm_source=express-rate-limit">
		<img height="75" src="https://devmark-public-assets.s3.us-west-2.amazonaws.com/sponsorships/mintlify.svg" alt="Create your docs today">
	</a>
</p>

---

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
