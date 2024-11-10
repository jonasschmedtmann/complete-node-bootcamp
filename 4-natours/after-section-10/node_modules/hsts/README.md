HTTP Strict Transport Security middleware
========================================
[![Build Status](https://travis-ci.org/helmetjs/hsts.svg?branch=master)](https://travis-ci.org/helmetjs/hsts)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

This middleware adds the `Strict-Transport-Security` header to the response. This tells browsers, "hey, only use HTTPS for the next period of time". ([See the spec](http://tools.ietf.org/html/rfc6797) for more.) Note that the header won't tell users on HTTP to *switch* to HTTPS, it will just tell HTTPS users to stick around. You can enforce HTTPS with the [express-enforces-ssl](https://github.com/aredo/express-enforces-ssl) module.

This will set the Strict Transport Security header, telling browsers to visit by HTTPS for the next 180 days:

```javascript
const hsts = require('hsts')

app.use(hsts({
  maxAge: 15552000  // 180 days in seconds
}))
// Strict-Transport-Security: max-age: 15552000; includeSubDomains
```

Note that the max age must be in seconds. *This was different in previous versions of this module!*

The `includeSubDomains` directive is present by default. If this header is set on *example.com*, supported browsers will also use HTTPS on *my-subdomain.example.com*. You can disable this:

```javascript
app.use(hsts({
  maxAge: 15552000,
  includeSubDomains: false
}))
```

Some browsers let you submit your site's HSTS to be baked into the browser. You can add `preload` to the header with the following code. You can check your eligibility and submit your site at [hstspreload.org](https://hstspreload.org/).

```javascript
app.use(hsts({
  maxAge: 31536000,        // Must be at least 1 year to be approved
  includeSubDomains: true, // Must be enabled to be approved
  preload: true
}))
```

This header will always be set because [the header is ignored in insecure HTTP](https://tools.ietf.org/html/rfc6797#section-8.1). You may wish to set it conditionally:

```javascript
const hstsMiddleware = hsts({
  maxAge: 1234000
})

app.use((req, res, next) => {
  if (req.secure) {
    hstsMiddleware(req, res, next)
  } else {
    next()
  }
})
```

This header is [somewhat well-supported by browsers](https://caniuse.com/#feat=stricttransportsecurity).
