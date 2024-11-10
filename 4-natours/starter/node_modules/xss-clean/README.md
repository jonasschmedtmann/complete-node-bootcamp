# Announcement

**This library has been deprecated. The implementation is quite simple, and I would suggest you copy the source code directly into your application using the [xss-filters](https://github.com/YahooArchive/xss-filters) dependency, or look for alternative libraries with more features and attention. Thanks for your support.**

---

Node.js Connect middleware to sanitize user input coming from POST body, GET queries, and url params. Works with [Express](http://expressjs.com/), [Restify](http://restify.com/), or any other [Connect](https://github.com/senchalabs/connect) app.

- [How to Use](#use)
- [License](#license)

## How to Use
```bash
npm install xss-clean --save
```

```javascript
const restify = require('restify')
const xss = require('xss-clean')

const app = restify.createServer()

app.use(restify.bodyParser())

// make sure this comes before any routes
app.use(xss())

app.listen(8080)
```

This will sanitize any data in `req.body`, `req.query`, and `req.params`. You can also access the API directly if you don't want to use as middleware.

```javascript
const clean = require('xss-clean/lib/xss').clean

const cleaned = clean('<script></script>')
// will return "&lt;script>&lt;/script>"
```
