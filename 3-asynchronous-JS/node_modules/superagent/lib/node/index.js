"use strict";

/**
 * Module dependencies.
 */

const {
  format
} = require('url');
const Stream = require('stream');
const https = require('https');
const http = require('http');
const fs = require('fs');
const zlib = require('zlib');
const util = require('util');
const qs = require('qs');
const mime = require('mime');
let methods = require('methods');
const FormData = require('form-data');
const formidable = require('formidable');
const debug = require('debug')('superagent');
const CookieJar = require('cookiejar');
const safeStringify = require('fast-safe-stringify');
const utils = require('../utils');
const RequestBase = require('../request-base');
const http2 = require('./http2wrapper');
const {
  decompress
} = require('./unzip');
const Response = require('./response');
const {
  mixin,
  hasOwn,
  isBrotliEncoding,
  isGzipOrDeflateEncoding
} = utils;
const {
  chooseDecompresser
} = require('./decompress');
function request(method, url) {
  // callback
  if (typeof url === 'function') {
    return new exports.Request('GET', method).end(url);
  }

  // url first
  if (arguments.length === 1) {
    return new exports.Request('GET', method);
  }
  return new exports.Request(method, url);
}
module.exports = request;
exports = module.exports;

/**
 * Expose `Request`.
 */

exports.Request = Request;

/**
 * Expose the agent function
 */

exports.agent = require('./agent');

/**
 * Noop.
 */

function noop() {}

/**
 * Expose `Response`.
 */

exports.Response = Response;

/**
 * Define "form" mime type.
 */

mime.define({
  'application/x-www-form-urlencoded': ['form', 'urlencoded', 'form-data']
}, true);

/**
 * Protocol map.
 */

exports.protocols = {
  'http:': http,
  'https:': https,
  'http2:': http2
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

exports.serialize = {
  'application/x-www-form-urlencoded': obj => {
    return qs.stringify(obj, {
      indices: false,
      strictNullHandling: true
    });
  },
  'application/json': safeStringify
};

/**
 * Default parsers.
 *
 *     superagent.parse['application/xml'] = function(res, fn){
 *       fn(null, res);
 *     };
 *
 */

exports.parse = require('./parsers');

/**
 * Default buffering map. Can be used to set certain
 * response types to buffer/not buffer.
 *
 *     superagent.buffer['application/xml'] = true;
 */
exports.buffer = {};

/**
 * Initialize internal header tracking properties on a request instance.
 *
 * @param {Object} req the instance
 * @api private
 */
function _initHeaders(request_) {
  request_._header = {
    // coerces header names to lowercase
  };
  request_.header = {
    // preserves header name case
  };
}

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String|Object} url
 * @api public
 */

function Request(method, url) {
  Stream.call(this);
  if (typeof url !== 'string') url = format(url);
  this._enableHttp2 = Boolean(process.env.HTTP2_TEST); // internal only
  this._agent = false;
  this._formData = null;
  this.method = method;
  this.url = url;
  _initHeaders(this);
  this.writable = true;
  this._redirects = 0;
  this.redirects(method === 'HEAD' ? 0 : 5);
  this.cookies = '';
  this.qs = {};
  this._query = [];
  this.qsRaw = this._query; // Unused, for backwards compatibility only
  this._redirectList = [];
  this._streamRequest = false;
  this._lookup = undefined;
  this.once('end', this.clearTimeout.bind(this));
}

/**
 * Inherit from `Stream` (which inherits from `EventEmitter`).
 * Mixin `RequestBase`.
 */
util.inherits(Request, Stream);
mixin(Request.prototype, RequestBase.prototype);

/**
 * Enable or Disable http2.
 *
 * Enable http2.
 *
 * ``` js
 * request.get('http://localhost/')
 *   .http2()
 *   .end(callback);
 *
 * request.get('http://localhost/')
 *   .http2(true)
 *   .end(callback);
 * ```
 *
 * Disable http2.
 *
 * ``` js
 * request = request.http2();
 * request.get('http://localhost/')
 *   .http2(false)
 *   .end(callback);
 * ```
 *
 * @param {Boolean} enable
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.http2 = function (bool) {
  if (exports.protocols['http2:'] === undefined) {
    throw new Error('superagent: this version of Node.js does not support http2');
  }
  this._enableHttp2 = bool === undefined ? true : bool;
  return this;
};

/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `options` (or filename).
 *
 * ``` js
 * request.post('http://localhost/upload')
 *   .attach('field', Buffer.from('<b>Hello world</b>'), 'hello.html')
 *   .end(callback);
 * ```
 *
 * A filename may also be used:
 *
 * ``` js
 * request.post('http://localhost/upload')
 *   .attach('files', 'image.jpg')
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {String|fs.ReadStream|Buffer} file
 * @param {String|Object} options
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.attach = function (field, file, options) {
  if (file) {
    if (this._data) {
      throw new Error("superagent can't mix .send() and .attach()");
    }
    let o = options || {};
    if (typeof options === 'string') {
      o = {
        filename: options
      };
    }
    if (typeof file === 'string') {
      if (!o.filename) o.filename = file;
      debug('creating `fs.ReadStream` instance for file: %s', file);
      file = fs.createReadStream(file);
      file.on('error', error => {
        const formData = this._getFormData();
        formData.emit('error', error);
      });
    } else if (!o.filename && file.path) {
      o.filename = file.path;
    }
    this._getFormData().append(field, file, o);
  }
  return this;
};
Request.prototype._getFormData = function () {
  if (!this._formData) {
    this._formData = new FormData();
    this._formData.on('error', error => {
      debug('FormData error', error);
      if (this.called) {
        // The request has already finished and the callback was called.
        // Silently ignore the error.
        return;
      }
      this.callback(error);
      this.abort();
    });
  }
  return this._formData;
};

/**
 * Gets/sets the `Agent` to use for this HTTP request. The default (if this
 * function is not called) is to opt out of connection pooling (`agent: false`).
 *
 * @param {http.Agent} agent
 * @return {http.Agent}
 * @api public
 */

Request.prototype.agent = function (agent) {
  if (arguments.length === 0) return this._agent;
  this._agent = agent;
  return this;
};

/**
 * Gets/sets the `lookup` function to use custom DNS resolver.
 *
 * @param {Function} lookup
 * @return {Function}
 * @api public
 */

Request.prototype.lookup = function (lookup) {
  if (arguments.length === 0) return this._lookup;
  this._lookup = lookup;
  return this;
};

/**
 * Set _Content-Type_ response header passed through `mime.getType()`.
 *
 * Examples:
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('json')
 *        .send(jsonstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/json')
 *        .send(jsonstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function (type) {
  return this.set('Content-Type', type.includes('/') ? type : mime.getType(type));
};

/**
 * Set _Accept_ response header passed through `mime.getType()`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function (type) {
  return this.set('Accept', type.includes('/') ? type : mime.getType(type));
};

/**
 * Add query-string `val`.
 *
 * Examples:
 *
 *   request.get('/shoes')
 *     .query('size=10')
 *     .query({ color: 'blue' })
 *
 * @param {Object|String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.query = function (value) {
  if (typeof value === 'string') {
    this._query.push(value);
  } else {
    Object.assign(this.qs, value);
  }
  return this;
};

/**
 * Write raw `data` / `encoding` to the socket.
 *
 * @param {Buffer|String} data
 * @param {String} encoding
 * @return {Boolean}
 * @api public
 */

Request.prototype.write = function (data, encoding) {
  const request_ = this.request();
  if (!this._streamRequest) {
    this._streamRequest = true;
  }
  return request_.write(data, encoding);
};

/**
 * Pipe the request body to `stream`.
 *
 * @param {Stream} stream
 * @param {Object} options
 * @return {Stream}
 * @api public
 */

Request.prototype.pipe = function (stream, options) {
  this.piped = true; // HACK...
  this.buffer(false);
  this.end();
  return this._pipeContinue(stream, options);
};
Request.prototype._pipeContinue = function (stream, options) {
  this.req.once('response', res => {
    // redirect
    if (isRedirect(res.statusCode) && this._redirects++ !== this._maxRedirects) {
      return this._redirect(res) === this ? this._pipeContinue(stream, options) : undefined;
    }
    this.res = res;
    this._emitResponse();
    if (this._aborted) return;
    if (this._shouldDecompress(res)) {
      let decompresser = chooseDecompresser(res);
      decompresser.on('error', error => {
        if (error && error.code === 'Z_BUF_ERROR') {
          // unexpected end of file is ignored by browsers and curl
          stream.emit('end');
          return;
        }
        stream.emit('error', error);
      });
      res.pipe(decompresser).pipe(stream, options);
      // don't emit 'end' until decompresser has completed writing all its data.
      decompresser.once('end', () => this.emit('end'));
    } else {
      res.pipe(stream, options);
      res.once('end', () => this.emit('end'));
    }
  });
  return stream;
};

/**
 * Enable / disable buffering.
 *
 * @return {Boolean} [val]
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.buffer = function (value) {
  this._buffer = value !== false;
  return this;
};

/**
 * Redirect to `url
 *
 * @param {IncomingMessage} res
 * @return {Request} for chaining
 * @api private
 */

Request.prototype._redirect = function (res) {
  let url = res.headers.location;
  if (!url) {
    return this.callback(new Error('No location header for redirect'), res);
  }
  debug('redirect %s -> %s', this.url, url);

  // location
  url = new URL(url, this.url).href;

  // ensure the response is being consumed
  // this is required for Node v0.10+
  res.resume();
  let headers = this.req.getHeaders ? this.req.getHeaders() : this.req._headers;
  const changesOrigin = new URL(url).host !== new URL(this.url).host;

  // implementation of 302 following defacto standard
  if (res.statusCode === 301 || res.statusCode === 302) {
    // strip Content-* related fields
    // in case of POST etc
    headers = utils.cleanHeader(headers, changesOrigin);

    // force GET
    this.method = this.method === 'HEAD' ? 'HEAD' : 'GET';

    // clear data
    this._data = null;
  }

  // 303 is always GET
  if (res.statusCode === 303) {
    // strip Content-* related fields
    // in case of POST etc
    headers = utils.cleanHeader(headers, changesOrigin);

    // force method
    this.method = 'GET';

    // clear data
    this._data = null;
  }

  // 307 preserves method
  // 308 preserves method
  delete headers.host;
  delete this.req;
  delete this._formData;

  // remove all add header except User-Agent
  _initHeaders(this);

  // redirect
  this.res = res;
  this._endCalled = false;
  this.url = url;
  this.qs = {};
  this._query.length = 0;
  this.set(headers);
  this._emitRedirect();
  this._redirectList.push(this.url);
  this.end(this._callback);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * Examples:
 *
 *   .auth('tobi', 'learnboost')
 *   .auth('tobi:learnboost')
 *   .auth('tobi')
 *   .auth(accessToken, { type: 'bearer' })
 *
 * @param {String} user
 * @param {String} [pass]
 * @param {Object} [options] options with authorization type 'basic' or 'bearer' ('basic' is default)
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function (user, pass, options) {
  if (arguments.length === 1) pass = '';
  if (typeof pass === 'object' && pass !== null) {
    // pass is optional and can be replaced with options
    options = pass;
    pass = '';
  }
  if (!options) {
    options = {
      type: 'basic'
    };
  }
  const encoder = string => Buffer.from(string).toString('base64');
  return this._auth(user, pass, options, encoder);
};

/**
 * Set the certificate authority option for https request.
 *
 * @param {Buffer | Array} cert
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.ca = function (cert) {
  this._ca = cert;
  return this;
};

/**
 * Set the client certificate key option for https request.
 *
 * @param {Buffer | String} cert
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.key = function (cert) {
  this._key = cert;
  return this;
};

/**
 * Set the key, certificate, and CA certs of the client in PFX or PKCS12 format.
 *
 * @param {Buffer | String} cert
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.pfx = function (cert) {
  if (typeof cert === 'object' && !Buffer.isBuffer(cert)) {
    this._pfx = cert.pfx;
    this._passphrase = cert.passphrase;
  } else {
    this._pfx = cert;
  }
  return this;
};

/**
 * Set the client certificate option for https request.
 *
 * @param {Buffer | String} cert
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.cert = function (cert) {
  this._cert = cert;
  return this;
};

/**
 * Do not reject expired or invalid TLS certs.
 * sets `rejectUnauthorized=true`. Be warned that this allows MITM attacks.
 *
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.disableTLSCerts = function () {
  this._disableTLSCerts = true;
  return this;
};

/**
 * Return an http[s] request.
 *
 * @return {OutgoingMessage}
 * @api private
 */

// eslint-disable-next-line complexity
Request.prototype.request = function () {
  if (this.req) return this.req;
  const options = {};
  try {
    const query = qs.stringify(this.qs, {
      indices: false,
      strictNullHandling: true
    });
    if (query) {
      this.qs = {};
      this._query.push(query);
    }
    this._finalizeQueryString();
  } catch (err) {
    return this.emit('error', err);
  }
  let {
    url: urlString
  } = this;
  const retries = this._retries;

  // default to http://
  if (urlString.indexOf('http') !== 0) urlString = `http://${urlString}`;
  const url = new URL(urlString);
  let {
    protocol
  } = url;
  let path = `${url.pathname}${url.search}`;

  // support unix sockets
  if (/^https?\+unix:/.test(protocol) === true) {
    // get the protocol
    protocol = `${protocol.split('+')[0]}:`;

    // get the socket path
    options.socketPath = url.hostname.replace(/%2F/g, '/');
    url.host = '';
    url.hostname = '';
  }

  // Override IP address of a hostname
  if (this._connectOverride) {
    const {
      hostname
    } = url;
    const match = hostname in this._connectOverride ? this._connectOverride[hostname] : this._connectOverride['*'];
    if (match) {
      // backup the real host
      if (!this._header.host) {
        this.set('host', url.host);
      }
      let newHost;
      let newPort;
      if (typeof match === 'object') {
        newHost = match.host;
        newPort = match.port;
      } else {
        newHost = match;
        newPort = url.port;
      }

      // wrap [ipv6]
      url.host = /:/.test(newHost) ? `[${newHost}]` : newHost;
      if (newPort) {
        url.host += `:${newPort}`;
        url.port = newPort;
      }
      url.hostname = newHost;
    }
  }

  // options
  options.method = this.method;
  options.port = url.port;
  options.path = path;
  options.host = url.hostname;
  options.ca = this._ca;
  options.key = this._key;
  options.pfx = this._pfx;
  options.cert = this._cert;
  options.passphrase = this._passphrase;
  options.agent = this._agent;
  options.lookup = this._lookup;
  options.rejectUnauthorized = typeof this._disableTLSCerts === 'boolean' ? !this._disableTLSCerts : process.env.NODE_TLS_REJECT_UNAUTHORIZED !== '0';

  // Allows request.get('https://1.2.3.4/').set('Host', 'example.com')
  if (this._header.host) {
    options.servername = this._header.host.replace(/:\d+$/, '');
  }
  if (this._trustLocalhost && /^(?:localhost|127\.0\.0\.\d+|(0*:)+:0*1)$/.test(url.hostname)) {
    options.rejectUnauthorized = false;
  }

  // initiate request
  const module_ = this._enableHttp2 ? exports.protocols['http2:'].setProtocol(protocol) : exports.protocols[protocol];

  // request
  this.req = module_.request(options);
  const {
    req
  } = this;

  // set tcp no delay
  req.setNoDelay(true);
  if (options.method !== 'HEAD') {
    req.setHeader('Accept-Encoding', 'gzip, deflate');
  }
  this.protocol = protocol;
  this.host = url.host;

  // expose events
  req.once('drain', () => {
    this.emit('drain');
  });
  req.on('error', error => {
    // flag abortion here for out timeouts
    // because node will emit a faux-error "socket hang up"
    // when request is aborted before a connection is made
    if (this._aborted) return;
    // if not the same, we are in the **old** (cancelled) request,
    // so need to continue (same as for above)
    if (this._retries !== retries) return;
    // if we've received a response then we don't want to let
    // an error in the request blow up the response
    if (this.response) return;
    this.callback(error);
  });

  // auth
  if (url.username || url.password) {
    this.auth(url.username, url.password);
  }
  if (this.username && this.password) {
    this.auth(this.username, this.password);
  }
  for (const key in this.header) {
    if (hasOwn(this.header, key)) req.setHeader(key, this.header[key]);
  }

  // add cookies
  if (this.cookies) {
    if (hasOwn(this._header, 'cookie')) {
      // merge
      const temporaryJar = new CookieJar.CookieJar();
      temporaryJar.setCookies(this._header.cookie.split('; '));
      temporaryJar.setCookies(this.cookies.split('; '));
      req.setHeader('Cookie', temporaryJar.getCookies(CookieJar.CookieAccessInfo.All).toValueString());
    } else {
      req.setHeader('Cookie', this.cookies);
    }
  }
  return req;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function (error, res) {
  if (this._shouldRetry(error, res)) {
    return this._retry();
  }

  // Avoid the error which is emitted from 'socket hang up' to cause the fn undefined error on JS runtime.
  const fn = this._callback || noop;
  this.clearTimeout();
  if (this.called) return console.warn('superagent: double callback bug');
  this.called = true;
  if (!error) {
    try {
      if (!this._isResponseOK(res)) {
        let message = 'Unsuccessful HTTP response';
        if (res) {
          message = http.STATUS_CODES[res.status] || message;
        }
        error = new Error(message);
        error.status = res ? res.status : undefined;
      }
    } catch (err) {
      error = err;
      error.status = error.status || (res ? res.status : undefined);
    }
  }

  // It's important that the callback is called outside try/catch
  // to avoid double callback
  if (!error) {
    return fn(null, res);
  }
  error.response = res;
  if (this._maxRetries) error.retries = this._retries - 1;

  // only emit error event if there is a listener
  // otherwise we assume the callback to `.end()` will get the error
  if (error && this.listeners('error').length > 0) {
    this.emit('error', error);
  }
  fn(error, res);
};

/**
 * Check if `obj` is a host object,
 *
 * @param {Object} obj host object
 * @return {Boolean} is a host object
 * @api private
 */
Request.prototype._isHost = function (object) {
  return Buffer.isBuffer(object) || object instanceof Stream || object instanceof FormData;
};

/**
 * Initiate request, invoking callback `fn(err, res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype._emitResponse = function (body, files) {
  const response = new Response(this);
  this.response = response;
  response.redirects = this._redirectList;
  if (undefined !== body) {
    response.body = body;
  }
  response.files = files;
  if (this._endCalled) {
    response.pipe = function () {
      throw new Error("end() has already been called, so it's too late to start piping");
    };
  }
  this.emit('response', response);
  return response;
};

/**
 * Emit `redirect` event, passing an instanceof `Response`.
 *
 * @api private
 */

Request.prototype._emitRedirect = function () {
  const response = new Response(this);
  response.redirects = this._redirectList;
  this.emit('redirect', response);
};
Request.prototype.end = function (fn) {
  this.request();
  debug('%s %s', this.method, this.url);
  if (this._endCalled) {
    throw new Error('.end() was called twice. This is not supported in superagent');
  }
  this._endCalled = true;

  // store callback
  this._callback = fn || noop;
  this._end();
};
Request.prototype._end = function () {
  if (this._aborted) return this.callback(new Error('The request has been aborted even before .end() was called'));
  let data = this._data;
  const {
    req
  } = this;
  const {
    method
  } = this;
  this._setTimeouts();

  // body
  if (method !== 'HEAD' && !req._headerSent) {
    // serialize stuff
    if (typeof data !== 'string') {
      let contentType = req.getHeader('Content-Type');
      // Parse out just the content type from the header (ignore the charset)
      if (contentType) contentType = contentType.split(';')[0];
      let serialize = this._serializer || exports.serialize[contentType];
      if (!serialize && isJSON(contentType)) {
        serialize = exports.serialize['application/json'];
      }
      if (serialize) data = serialize(data);
    }

    // content-length
    if (data && !req.getHeader('Content-Length')) {
      req.setHeader('Content-Length', Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data));
    }
  }

  // response
  // eslint-disable-next-line complexity
  req.once('response', res => {
    debug('%s %s -> %s', this.method, this.url, res.statusCode);
    if (this._responseTimeoutTimer) {
      clearTimeout(this._responseTimeoutTimer);
    }
    if (this.piped) {
      return;
    }
    const max = this._maxRedirects;
    const mime = utils.type(res.headers['content-type'] || '') || 'text/plain';
    let type = mime.split('/')[0];
    if (type) type = type.toLowerCase().trim();
    const multipart = type === 'multipart';
    const redirect = isRedirect(res.statusCode);
    const responseType = this._responseType;
    this.res = res;

    // redirect
    if (redirect && this._redirects++ !== max) {
      return this._redirect(res);
    }
    if (this.method === 'HEAD') {
      this.emit('end');
      this.callback(null, this._emitResponse());
      return;
    }

    // zlib support
    if (this._shouldDecompress(res)) {
      decompress(req, res);
    }
    let buffer = this._buffer;
    if (buffer === undefined && mime in exports.buffer) {
      buffer = Boolean(exports.buffer[mime]);
    }
    let parser = this._parser;
    if (undefined === buffer && parser) {
      console.warn("A custom superagent parser has been set, but buffering strategy for the parser hasn't been configured. Call `req.buffer(true or false)` or set `superagent.buffer[mime] = true or false`");
      buffer = true;
    }
    if (!parser) {
      if (responseType) {
        parser = exports.parse.image; // It's actually a generic Buffer
        buffer = true;
      } else if (multipart) {
        const form = formidable.formidable();
        parser = form.parse.bind(form);
        buffer = true;
      } else if (isBinary(mime)) {
        parser = exports.parse.image;
        buffer = true; // For backwards-compatibility buffering default is ad-hoc MIME-dependent
      } else if (exports.parse[mime]) {
        parser = exports.parse[mime];
      } else if (type === 'text') {
        parser = exports.parse.text;
        buffer = buffer !== false;
        // everyone wants their own white-labeled json
      } else if (isJSON(mime)) {
        parser = exports.parse['application/json'];
        buffer = buffer !== false;
      } else if (buffer) {
        parser = exports.parse.text;
      } else if (undefined === buffer) {
        parser = exports.parse.image; // It's actually a generic Buffer
        buffer = true;
      }
    }

    // by default only buffer text/*, json and messed up thing from hell
    if (undefined === buffer && isText(mime) || isJSON(mime)) {
      buffer = true;
    }
    this._resBuffered = buffer;
    let parserHandlesEnd = false;
    if (buffer) {
      // Protectiona against zip bombs and other nuisance
      let responseBytesLeft = this._maxResponseSize || 200000000;
      res.on('data', buf => {
        responseBytesLeft -= buf.byteLength || buf.length > 0 ? buf.length : 0;
        if (responseBytesLeft < 0) {
          // This will propagate through error event
          const error = new Error('Maximum response size reached');
          error.code = 'ETOOLARGE';
          // Parsers aren't required to observe error event,
          // so would incorrectly report success
          parserHandlesEnd = false;
          // Will not emit error event
          res.destroy(error);
          // so we do callback now
          this.callback(error, null);
        }
      });
    }
    if (parser) {
      try {
        // Unbuffered parsers are supposed to emit response early,
        // which is weird BTW, because response.body won't be there.
        parserHandlesEnd = buffer;
        parser(res, (error, object, files) => {
          if (this.timedout) {
            // Timeout has already handled all callbacks
            return;
          }

          // Intentional (non-timeout) abort is supposed to preserve partial response,
          // even if it doesn't parse.
          if (error && !this._aborted) {
            return this.callback(error);
          }
          if (parserHandlesEnd) {
            if (multipart) {
              // formidable v3 always returns an array with the value in it
              // so we need to flatten it
              if (object) {
                for (const key in object) {
                  const value = object[key];
                  if (Array.isArray(value) && value.length === 1) {
                    object[key] = value[0];
                  } else {
                    object[key] = value;
                  }
                }
              }
              if (files) {
                for (const key in files) {
                  const value = files[key];
                  if (Array.isArray(value) && value.length === 1) {
                    files[key] = value[0];
                  } else {
                    files[key] = value;
                  }
                }
              }
            }
            this.emit('end');
            this.callback(null, this._emitResponse(object, files));
          }
        });
      } catch (err) {
        this.callback(err);
        return;
      }
    }
    this.res = res;

    // unbuffered
    if (!buffer) {
      debug('unbuffered %s %s', this.method, this.url);
      this.callback(null, this._emitResponse());
      if (multipart) return; // allow multipart to handle end event
      res.once('end', () => {
        debug('end %s %s', this.method, this.url);
        this.emit('end');
      });
      return;
    }

    // terminating events
    res.once('error', error => {
      parserHandlesEnd = false;
      this.callback(error, null);
    });
    if (!parserHandlesEnd) res.once('end', () => {
      debug('end %s %s', this.method, this.url);
      // TODO: unless buffering emit earlier to stream
      this.emit('end');
      this.callback(null, this._emitResponse());
    });
  });
  this.emit('request', this);
  const getProgressMonitor = () => {
    const lengthComputable = true;
    const total = req.getHeader('Content-Length');
    let loaded = 0;
    const progress = new Stream.Transform();
    progress._transform = (chunk, encoding, callback) => {
      loaded += chunk.length;
      this.emit('progress', {
        direction: 'upload',
        lengthComputable,
        loaded,
        total
      });
      callback(null, chunk);
    };
    return progress;
  };
  const bufferToChunks = buffer => {
    const chunkSize = 16 * 1024; // default highWaterMark value
    const chunking = new Stream.Readable();
    const totalLength = buffer.length;
    const remainder = totalLength % chunkSize;
    const cutoff = totalLength - remainder;
    for (let i = 0; i < cutoff; i += chunkSize) {
      const chunk = buffer.slice(i, i + chunkSize);
      chunking.push(chunk);
    }
    if (remainder > 0) {
      const remainderBuffer = buffer.slice(-remainder);
      chunking.push(remainderBuffer);
    }
    chunking.push(null); // no more data

    return chunking;
  };

  // if a FormData instance got created, then we send that as the request body
  const formData = this._formData;
  if (formData) {
    // set headers
    const headers = formData.getHeaders();
    for (const i in headers) {
      if (hasOwn(headers, i)) {
        debug('setting FormData header: "%s: %s"', i, headers[i]);
        req.setHeader(i, headers[i]);
      }
    }

    // attempt to get "Content-Length" header
    formData.getLength((error, length) => {
      // TODO: Add chunked encoding when no length (if err)
      if (error) debug('formData.getLength had error', error, length);
      debug('got FormData Content-Length: %s', length);
      if (typeof length === 'number') {
        req.setHeader('Content-Length', length);
      }
      formData.pipe(getProgressMonitor()).pipe(req);
    });
  } else if (Buffer.isBuffer(data)) {
    bufferToChunks(data).pipe(getProgressMonitor()).pipe(req);
  } else {
    req.end(data);
  }
};

// Check whether response has a non-0-sized gzip-encoded body
Request.prototype._shouldDecompress = res => {
  return hasNonEmptyResponseContent(res) && (isGzipOrDeflateEncoding(res) || isBrotliEncoding(res));
};

/**
 * Overrides DNS for selected hostnames. Takes object mapping hostnames to IP addresses.
 *
 * When making a request to a URL with a hostname exactly matching a key in the object,
 * use the given IP address to connect, instead of using DNS to resolve the hostname.
 *
 * A special host `*` matches every hostname (keep redirects in mind!)
 *
 *      request.connect({
 *        'test.example.com': '127.0.0.1',
 *        'ipv6.example.com': '::1',
 *      })
 */
Request.prototype.connect = function (connectOverride) {
  if (typeof connectOverride === 'string') {
    this._connectOverride = {
      '*': connectOverride
    };
  } else if (typeof connectOverride === 'object') {
    this._connectOverride = connectOverride;
  } else {
    this._connectOverride = undefined;
  }
  return this;
};
Request.prototype.trustLocalhost = function (toggle) {
  this._trustLocalhost = toggle === undefined ? true : toggle;
  return this;
};

// generate HTTP verb methods
if (!methods.includes('del')) {
  // create a copy so we don't cause conflicts with
  // other packages using the methods package and
  // npm 3.x
  methods = [...methods];
  methods.push('del');
}
for (let method of methods) {
  const name = method;
  method = method === 'del' ? 'delete' : method;
  method = method.toUpperCase();
  request[name] = (url, data, fn) => {
    const request_ = request(method, url);
    if (typeof data === 'function') {
      fn = data;
      data = null;
    }
    if (data) {
      if (method === 'GET' || method === 'HEAD') {
        request_.query(data);
      } else {
        request_.send(data);
      }
    }
    if (fn) request_.end(fn);
    return request_;
  };
}

/**
 * Check if `mime` is text and should be buffered.
 *
 * @param {String} mime
 * @return {Boolean}
 * @api public
 */

function isText(mime) {
  const parts = mime.split('/');
  let type = parts[0];
  if (type) type = type.toLowerCase().trim();
  let subtype = parts[1];
  if (subtype) subtype = subtype.toLowerCase().trim();
  return type === 'text' || subtype === 'x-www-form-urlencoded';
}

// This is not a catchall, but a start. It might be useful
// in the long run to have file that includes all binary
// content types from https://www.iana.org/assignments/media-types/media-types.xhtml
function isBinary(mime) {
  let [registry, name] = mime.split('/');
  if (registry) registry = registry.toLowerCase().trim();
  if (name) name = name.toLowerCase().trim();
  return ['audio', 'font', 'image', 'video'].includes(registry) || ['gz', 'gzip'].includes(name);
}

/**
 * Check if `mime` is json or has +json structured syntax suffix.
 *
 * @param {String} mime
 * @return {Boolean}
 * @api private
 */

function isJSON(mime) {
  // should match /json or +json
  // but not /json-seq
  return /[/+]json($|[^-\w])/i.test(mime);
}

/**
 * Check if we should follow the redirect `code`.
 *
 * @param {Number} code
 * @return {Boolean}
 * @api private
 */

function isRedirect(code) {
  return [301, 302, 303, 305, 307, 308].includes(code);
}
function hasNonEmptyResponseContent(res) {
  if (res.statusCode === 204 || res.statusCode === 304) {
    // These aren't supposed to have any body
    return false;
  }

  // header content is a string, and distinction between 0 and no information is crucial
  if (res.headers['content-length'] === '0') {
    // We know that the body is empty (unfortunately, this check does not cover chunked encoding)
    return false;
  }
  return true;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmb3JtYXQiLCJyZXF1aXJlIiwiU3RyZWFtIiwiaHR0cHMiLCJodHRwIiwiZnMiLCJ6bGliIiwidXRpbCIsInFzIiwibWltZSIsIm1ldGhvZHMiLCJGb3JtRGF0YSIsImZvcm1pZGFibGUiLCJkZWJ1ZyIsIkNvb2tpZUphciIsInNhZmVTdHJpbmdpZnkiLCJ1dGlscyIsIlJlcXVlc3RCYXNlIiwiaHR0cDIiLCJkZWNvbXByZXNzIiwiUmVzcG9uc2UiLCJtaXhpbiIsImhhc093biIsImlzQnJvdGxpRW5jb2RpbmciLCJpc0d6aXBPckRlZmxhdGVFbmNvZGluZyIsImNob29zZURlY29tcHJlc3NlciIsInJlcXVlc3QiLCJtZXRob2QiLCJ1cmwiLCJleHBvcnRzIiwiUmVxdWVzdCIsImVuZCIsImFyZ3VtZW50cyIsImxlbmd0aCIsIm1vZHVsZSIsImFnZW50Iiwibm9vcCIsImRlZmluZSIsInByb3RvY29scyIsInNlcmlhbGl6ZSIsIm9iaiIsInN0cmluZ2lmeSIsImluZGljZXMiLCJzdHJpY3ROdWxsSGFuZGxpbmciLCJwYXJzZSIsImJ1ZmZlciIsIl9pbml0SGVhZGVycyIsInJlcXVlc3RfIiwiX2hlYWRlciIsImhlYWRlciIsImNhbGwiLCJfZW5hYmxlSHR0cDIiLCJCb29sZWFuIiwicHJvY2VzcyIsImVudiIsIkhUVFAyX1RFU1QiLCJfYWdlbnQiLCJfZm9ybURhdGEiLCJ3cml0YWJsZSIsIl9yZWRpcmVjdHMiLCJyZWRpcmVjdHMiLCJjb29raWVzIiwiX3F1ZXJ5IiwicXNSYXciLCJfcmVkaXJlY3RMaXN0IiwiX3N0cmVhbVJlcXVlc3QiLCJfbG9va3VwIiwidW5kZWZpbmVkIiwib25jZSIsImNsZWFyVGltZW91dCIsImJpbmQiLCJpbmhlcml0cyIsInByb3RvdHlwZSIsImJvb2wiLCJFcnJvciIsImF0dGFjaCIsImZpZWxkIiwiZmlsZSIsIm9wdGlvbnMiLCJfZGF0YSIsIm8iLCJmaWxlbmFtZSIsImNyZWF0ZVJlYWRTdHJlYW0iLCJvbiIsImVycm9yIiwiZm9ybURhdGEiLCJfZ2V0Rm9ybURhdGEiLCJlbWl0IiwicGF0aCIsImFwcGVuZCIsImNhbGxlZCIsImNhbGxiYWNrIiwiYWJvcnQiLCJsb29rdXAiLCJ0eXBlIiwic2V0IiwiaW5jbHVkZXMiLCJnZXRUeXBlIiwiYWNjZXB0IiwicXVlcnkiLCJ2YWx1ZSIsInB1c2giLCJPYmplY3QiLCJhc3NpZ24iLCJ3cml0ZSIsImRhdGEiLCJlbmNvZGluZyIsInBpcGUiLCJzdHJlYW0iLCJwaXBlZCIsIl9waXBlQ29udGludWUiLCJyZXEiLCJyZXMiLCJpc1JlZGlyZWN0Iiwic3RhdHVzQ29kZSIsIl9tYXhSZWRpcmVjdHMiLCJfcmVkaXJlY3QiLCJfZW1pdFJlc3BvbnNlIiwiX2Fib3J0ZWQiLCJfc2hvdWxkRGVjb21wcmVzcyIsImRlY29tcHJlc3NlciIsImNvZGUiLCJfYnVmZmVyIiwiaGVhZGVycyIsImxvY2F0aW9uIiwiVVJMIiwiaHJlZiIsInJlc3VtZSIsImdldEhlYWRlcnMiLCJfaGVhZGVycyIsImNoYW5nZXNPcmlnaW4iLCJob3N0IiwiY2xlYW5IZWFkZXIiLCJfZW5kQ2FsbGVkIiwiX2VtaXRSZWRpcmVjdCIsIl9jYWxsYmFjayIsImF1dGgiLCJ1c2VyIiwicGFzcyIsImVuY29kZXIiLCJzdHJpbmciLCJCdWZmZXIiLCJmcm9tIiwidG9TdHJpbmciLCJfYXV0aCIsImNhIiwiY2VydCIsIl9jYSIsImtleSIsIl9rZXkiLCJwZngiLCJpc0J1ZmZlciIsIl9wZngiLCJfcGFzc3BocmFzZSIsInBhc3NwaHJhc2UiLCJfY2VydCIsImRpc2FibGVUTFNDZXJ0cyIsIl9kaXNhYmxlVExTQ2VydHMiLCJfZmluYWxpemVRdWVyeVN0cmluZyIsImVyciIsInVybFN0cmluZyIsInJldHJpZXMiLCJfcmV0cmllcyIsImluZGV4T2YiLCJwcm90b2NvbCIsInBhdGhuYW1lIiwic2VhcmNoIiwidGVzdCIsInNwbGl0Iiwic29ja2V0UGF0aCIsImhvc3RuYW1lIiwicmVwbGFjZSIsIl9jb25uZWN0T3ZlcnJpZGUiLCJtYXRjaCIsIm5ld0hvc3QiLCJuZXdQb3J0IiwicG9ydCIsInJlamVjdFVuYXV0aG9yaXplZCIsIk5PREVfVExTX1JFSkVDVF9VTkFVVEhPUklaRUQiLCJzZXJ2ZXJuYW1lIiwiX3RydXN0TG9jYWxob3N0IiwibW9kdWxlXyIsInNldFByb3RvY29sIiwic2V0Tm9EZWxheSIsInNldEhlYWRlciIsInJlc3BvbnNlIiwidXNlcm5hbWUiLCJwYXNzd29yZCIsInRlbXBvcmFyeUphciIsInNldENvb2tpZXMiLCJjb29raWUiLCJnZXRDb29raWVzIiwiQ29va2llQWNjZXNzSW5mbyIsIkFsbCIsInRvVmFsdWVTdHJpbmciLCJfc2hvdWxkUmV0cnkiLCJfcmV0cnkiLCJmbiIsImNvbnNvbGUiLCJ3YXJuIiwiX2lzUmVzcG9uc2VPSyIsIm1lc3NhZ2UiLCJTVEFUVVNfQ09ERVMiLCJzdGF0dXMiLCJfbWF4UmV0cmllcyIsImxpc3RlbmVycyIsIl9pc0hvc3QiLCJvYmplY3QiLCJib2R5IiwiZmlsZXMiLCJfZW5kIiwiX3NldFRpbWVvdXRzIiwiX2hlYWRlclNlbnQiLCJjb250ZW50VHlwZSIsImdldEhlYWRlciIsIl9zZXJpYWxpemVyIiwiaXNKU09OIiwiYnl0ZUxlbmd0aCIsIl9yZXNwb25zZVRpbWVvdXRUaW1lciIsIm1heCIsInRvTG93ZXJDYXNlIiwidHJpbSIsIm11bHRpcGFydCIsInJlZGlyZWN0IiwicmVzcG9uc2VUeXBlIiwiX3Jlc3BvbnNlVHlwZSIsInBhcnNlciIsIl9wYXJzZXIiLCJpbWFnZSIsImZvcm0iLCJpc0JpbmFyeSIsInRleHQiLCJpc1RleHQiLCJfcmVzQnVmZmVyZWQiLCJwYXJzZXJIYW5kbGVzRW5kIiwicmVzcG9uc2VCeXRlc0xlZnQiLCJfbWF4UmVzcG9uc2VTaXplIiwiYnVmIiwiZGVzdHJveSIsInRpbWVkb3V0IiwiQXJyYXkiLCJpc0FycmF5IiwiZ2V0UHJvZ3Jlc3NNb25pdG9yIiwibGVuZ3RoQ29tcHV0YWJsZSIsInRvdGFsIiwibG9hZGVkIiwicHJvZ3Jlc3MiLCJUcmFuc2Zvcm0iLCJfdHJhbnNmb3JtIiwiY2h1bmsiLCJkaXJlY3Rpb24iLCJidWZmZXJUb0NodW5rcyIsImNodW5rU2l6ZSIsImNodW5raW5nIiwiUmVhZGFibGUiLCJ0b3RhbExlbmd0aCIsInJlbWFpbmRlciIsImN1dG9mZiIsImkiLCJzbGljZSIsInJlbWFpbmRlckJ1ZmZlciIsImdldExlbmd0aCIsImhhc05vbkVtcHR5UmVzcG9uc2VDb250ZW50IiwiY29ubmVjdCIsImNvbm5lY3RPdmVycmlkZSIsInRydXN0TG9jYWxob3N0IiwidG9nZ2xlIiwibmFtZSIsInRvVXBwZXJDYXNlIiwic2VuZCIsInBhcnRzIiwic3VidHlwZSIsInJlZ2lzdHJ5Il0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL25vZGUvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbmNvbnN0IHsgZm9ybWF0IH0gPSByZXF1aXJlKCd1cmwnKTtcbmNvbnN0IFN0cmVhbSA9IHJlcXVpcmUoJ3N0cmVhbScpO1xuY29uc3QgaHR0cHMgPSByZXF1aXJlKCdodHRwcycpO1xuY29uc3QgaHR0cCA9IHJlcXVpcmUoJ2h0dHAnKTtcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmNvbnN0IHpsaWIgPSByZXF1aXJlKCd6bGliJyk7XG5jb25zdCB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xuY29uc3QgcXMgPSByZXF1aXJlKCdxcycpO1xuY29uc3QgbWltZSA9IHJlcXVpcmUoJ21pbWUnKTtcbmxldCBtZXRob2RzID0gcmVxdWlyZSgnbWV0aG9kcycpO1xuY29uc3QgRm9ybURhdGEgPSByZXF1aXJlKCdmb3JtLWRhdGEnKTtcbmNvbnN0IGZvcm1pZGFibGUgPSByZXF1aXJlKCdmb3JtaWRhYmxlJyk7XG5jb25zdCBkZWJ1ZyA9IHJlcXVpcmUoJ2RlYnVnJykoJ3N1cGVyYWdlbnQnKTtcbmNvbnN0IENvb2tpZUphciA9IHJlcXVpcmUoJ2Nvb2tpZWphcicpO1xuY29uc3Qgc2FmZVN0cmluZ2lmeSA9IHJlcXVpcmUoJ2Zhc3Qtc2FmZS1zdHJpbmdpZnknKTtcblxuY29uc3QgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuY29uc3QgUmVxdWVzdEJhc2UgPSByZXF1aXJlKCcuLi9yZXF1ZXN0LWJhc2UnKTtcbmNvbnN0IGh0dHAyID0gcmVxdWlyZSgnLi9odHRwMndyYXBwZXInKTtcbmNvbnN0IHsgZGVjb21wcmVzcyB9ID0gcmVxdWlyZSgnLi91bnppcCcpO1xuY29uc3QgUmVzcG9uc2UgPSByZXF1aXJlKCcuL3Jlc3BvbnNlJyk7XG5cbmNvbnN0IHsgbWl4aW4sIGhhc093biwgaXNCcm90bGlFbmNvZGluZywgaXNHemlwT3JEZWZsYXRlRW5jb2RpbmcgfSA9IHV0aWxzO1xuY29uc3QgeyBjaG9vc2VEZWNvbXByZXNzZXIgfSA9IHJlcXVpcmUoJy4vZGVjb21wcmVzcycpO1xuXG5mdW5jdGlvbiByZXF1ZXN0KG1ldGhvZCwgdXJsKSB7XG4gIC8vIGNhbGxiYWNrXG4gIGlmICh0eXBlb2YgdXJsID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIG5ldyBleHBvcnRzLlJlcXVlc3QoJ0dFVCcsIG1ldGhvZCkuZW5kKHVybCk7XG4gIH1cblxuICAvLyB1cmwgZmlyc3RcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICByZXR1cm4gbmV3IGV4cG9ydHMuUmVxdWVzdCgnR0VUJywgbWV0aG9kKTtcbiAgfVxuXG4gIHJldHVybiBuZXcgZXhwb3J0cy5SZXF1ZXN0KG1ldGhvZCwgdXJsKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSByZXF1ZXN0O1xuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzO1xuXG4vKipcbiAqIEV4cG9zZSBgUmVxdWVzdGAuXG4gKi9cblxuZXhwb3J0cy5SZXF1ZXN0ID0gUmVxdWVzdDtcblxuLyoqXG4gKiBFeHBvc2UgdGhlIGFnZW50IGZ1bmN0aW9uXG4gKi9cblxuZXhwb3J0cy5hZ2VudCA9IHJlcXVpcmUoJy4vYWdlbnQnKTtcblxuLyoqXG4gKiBOb29wLlxuICovXG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG4vKipcbiAqIEV4cG9zZSBgUmVzcG9uc2VgLlxuICovXG5cbmV4cG9ydHMuUmVzcG9uc2UgPSBSZXNwb25zZTtcblxuLyoqXG4gKiBEZWZpbmUgXCJmb3JtXCIgbWltZSB0eXBlLlxuICovXG5cbm1pbWUuZGVmaW5lKFxuICB7XG4gICAgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCc6IFsnZm9ybScsICd1cmxlbmNvZGVkJywgJ2Zvcm0tZGF0YSddXG4gIH0sXG4gIHRydWVcbik7XG5cbi8qKlxuICogUHJvdG9jb2wgbWFwLlxuICovXG5cbmV4cG9ydHMucHJvdG9jb2xzID0ge1xuICAnaHR0cDonOiBodHRwLFxuICAnaHR0cHM6JzogaHR0cHMsXG4gICdodHRwMjonOiBodHRwMlxufTtcblxuLyoqXG4gKiBEZWZhdWx0IHNlcmlhbGl6YXRpb24gbWFwLlxuICpcbiAqICAgICBzdXBlcmFnZW50LnNlcmlhbGl6ZVsnYXBwbGljYXRpb24veG1sJ10gPSBmdW5jdGlvbihvYmope1xuICogICAgICAgcmV0dXJuICdnZW5lcmF0ZWQgeG1sIGhlcmUnO1xuICogICAgIH07XG4gKlxuICovXG5cbmV4cG9ydHMuc2VyaWFsaXplID0ge1xuICAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJzogKG9iaikgPT4ge1xuICAgIHJldHVybiBxcy5zdHJpbmdpZnkob2JqLCB7IGluZGljZXM6IGZhbHNlLCBzdHJpY3ROdWxsSGFuZGxpbmc6IHRydWUgfSk7XG4gIH0sXG4gICdhcHBsaWNhdGlvbi9qc29uJzogc2FmZVN0cmluZ2lmeVxufTtcblxuLyoqXG4gKiBEZWZhdWx0IHBhcnNlcnMuXG4gKlxuICogICAgIHN1cGVyYWdlbnQucGFyc2VbJ2FwcGxpY2F0aW9uL3htbCddID0gZnVuY3Rpb24ocmVzLCBmbil7XG4gKiAgICAgICBmbihudWxsLCByZXMpO1xuICogICAgIH07XG4gKlxuICovXG5cbmV4cG9ydHMucGFyc2UgPSByZXF1aXJlKCcuL3BhcnNlcnMnKTtcblxuLyoqXG4gKiBEZWZhdWx0IGJ1ZmZlcmluZyBtYXAuIENhbiBiZSB1c2VkIHRvIHNldCBjZXJ0YWluXG4gKiByZXNwb25zZSB0eXBlcyB0byBidWZmZXIvbm90IGJ1ZmZlci5cbiAqXG4gKiAgICAgc3VwZXJhZ2VudC5idWZmZXJbJ2FwcGxpY2F0aW9uL3htbCddID0gdHJ1ZTtcbiAqL1xuZXhwb3J0cy5idWZmZXIgPSB7fTtcblxuLyoqXG4gKiBJbml0aWFsaXplIGludGVybmFsIGhlYWRlciB0cmFja2luZyBwcm9wZXJ0aWVzIG9uIGEgcmVxdWVzdCBpbnN0YW5jZS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcmVxIHRoZSBpbnN0YW5jZVxuICogQGFwaSBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIF9pbml0SGVhZGVycyhyZXF1ZXN0Xykge1xuICByZXF1ZXN0Xy5faGVhZGVyID0ge1xuICAgIC8vIGNvZXJjZXMgaGVhZGVyIG5hbWVzIHRvIGxvd2VyY2FzZVxuICB9O1xuICByZXF1ZXN0Xy5oZWFkZXIgPSB7XG4gICAgLy8gcHJlc2VydmVzIGhlYWRlciBuYW1lIGNhc2VcbiAgfTtcbn1cblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBSZXF1ZXN0YCB3aXRoIHRoZSBnaXZlbiBgbWV0aG9kYCBhbmQgYHVybGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZFxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSB1cmxcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gUmVxdWVzdChtZXRob2QsIHVybCkge1xuICBTdHJlYW0uY2FsbCh0aGlzKTtcbiAgaWYgKHR5cGVvZiB1cmwgIT09ICdzdHJpbmcnKSB1cmwgPSBmb3JtYXQodXJsKTtcbiAgdGhpcy5fZW5hYmxlSHR0cDIgPSBCb29sZWFuKHByb2Nlc3MuZW52LkhUVFAyX1RFU1QpOyAvLyBpbnRlcm5hbCBvbmx5XG4gIHRoaXMuX2FnZW50ID0gZmFsc2U7XG4gIHRoaXMuX2Zvcm1EYXRhID0gbnVsbDtcbiAgdGhpcy5tZXRob2QgPSBtZXRob2Q7XG4gIHRoaXMudXJsID0gdXJsO1xuICBfaW5pdEhlYWRlcnModGhpcyk7XG4gIHRoaXMud3JpdGFibGUgPSB0cnVlO1xuICB0aGlzLl9yZWRpcmVjdHMgPSAwO1xuICB0aGlzLnJlZGlyZWN0cyhtZXRob2QgPT09ICdIRUFEJyA/IDAgOiA1KTtcbiAgdGhpcy5jb29raWVzID0gJyc7XG4gIHRoaXMucXMgPSB7fTtcbiAgdGhpcy5fcXVlcnkgPSBbXTtcbiAgdGhpcy5xc1JhdyA9IHRoaXMuX3F1ZXJ5OyAvLyBVbnVzZWQsIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSBvbmx5XG4gIHRoaXMuX3JlZGlyZWN0TGlzdCA9IFtdO1xuICB0aGlzLl9zdHJlYW1SZXF1ZXN0ID0gZmFsc2U7XG4gIHRoaXMuX2xvb2t1cCA9IHVuZGVmaW5lZDtcbiAgdGhpcy5vbmNlKCdlbmQnLCB0aGlzLmNsZWFyVGltZW91dC5iaW5kKHRoaXMpKTtcbn1cblxuLyoqXG4gKiBJbmhlcml0IGZyb20gYFN0cmVhbWAgKHdoaWNoIGluaGVyaXRzIGZyb20gYEV2ZW50RW1pdHRlcmApLlxuICogTWl4aW4gYFJlcXVlc3RCYXNlYC5cbiAqL1xudXRpbC5pbmhlcml0cyhSZXF1ZXN0LCBTdHJlYW0pO1xuXG5taXhpbihSZXF1ZXN0LnByb3RvdHlwZSwgUmVxdWVzdEJhc2UucHJvdG90eXBlKTtcblxuLyoqXG4gKiBFbmFibGUgb3IgRGlzYWJsZSBodHRwMi5cbiAqXG4gKiBFbmFibGUgaHR0cDIuXG4gKlxuICogYGBgIGpzXG4gKiByZXF1ZXN0LmdldCgnaHR0cDovL2xvY2FsaG9zdC8nKVxuICogICAuaHR0cDIoKVxuICogICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiByZXF1ZXN0LmdldCgnaHR0cDovL2xvY2FsaG9zdC8nKVxuICogICAuaHR0cDIodHJ1ZSlcbiAqICAgLmVuZChjYWxsYmFjayk7XG4gKiBgYGBcbiAqXG4gKiBEaXNhYmxlIGh0dHAyLlxuICpcbiAqIGBgYCBqc1xuICogcmVxdWVzdCA9IHJlcXVlc3QuaHR0cDIoKTtcbiAqIHJlcXVlc3QuZ2V0KCdodHRwOi8vbG9jYWxob3N0LycpXG4gKiAgIC5odHRwMihmYWxzZSlcbiAqICAgLmVuZChjYWxsYmFjayk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGVuYWJsZVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmh0dHAyID0gZnVuY3Rpb24gKGJvb2wpIHtcbiAgaWYgKGV4cG9ydHMucHJvdG9jb2xzWydodHRwMjonXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgJ3N1cGVyYWdlbnQ6IHRoaXMgdmVyc2lvbiBvZiBOb2RlLmpzIGRvZXMgbm90IHN1cHBvcnQgaHR0cDInXG4gICAgKTtcbiAgfVxuXG4gIHRoaXMuX2VuYWJsZUh0dHAyID0gYm9vbCA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IGJvb2w7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBRdWV1ZSB0aGUgZ2l2ZW4gYGZpbGVgIGFzIGFuIGF0dGFjaG1lbnQgdG8gdGhlIHNwZWNpZmllZCBgZmllbGRgLFxuICogd2l0aCBvcHRpb25hbCBgb3B0aW9uc2AgKG9yIGZpbGVuYW1lKS5cbiAqXG4gKiBgYGAganNcbiAqIHJlcXVlc3QucG9zdCgnaHR0cDovL2xvY2FsaG9zdC91cGxvYWQnKVxuICogICAuYXR0YWNoKCdmaWVsZCcsIEJ1ZmZlci5mcm9tKCc8Yj5IZWxsbyB3b3JsZDwvYj4nKSwgJ2hlbGxvLmh0bWwnKVxuICogICAuZW5kKGNhbGxiYWNrKTtcbiAqIGBgYFxuICpcbiAqIEEgZmlsZW5hbWUgbWF5IGFsc28gYmUgdXNlZDpcbiAqXG4gKiBgYGAganNcbiAqIHJlcXVlc3QucG9zdCgnaHR0cDovL2xvY2FsaG9zdC91cGxvYWQnKVxuICogICAuYXR0YWNoKCdmaWxlcycsICdpbWFnZS5qcGcnKVxuICogICAuZW5kKGNhbGxiYWNrKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHBhcmFtIHtTdHJpbmd8ZnMuUmVhZFN0cmVhbXxCdWZmZXJ9IGZpbGVcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gb3B0aW9uc1xuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmF0dGFjaCA9IGZ1bmN0aW9uIChmaWVsZCwgZmlsZSwgb3B0aW9ucykge1xuICBpZiAoZmlsZSkge1xuICAgIGlmICh0aGlzLl9kYXRhKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJzdXBlcmFnZW50IGNhbid0IG1peCAuc2VuZCgpIGFuZCAuYXR0YWNoKClcIik7XG4gICAgfVxuXG4gICAgbGV0IG8gPSBvcHRpb25zIHx8IHt9O1xuICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIG8gPSB7IGZpbGVuYW1lOiBvcHRpb25zIH07XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBmaWxlID09PSAnc3RyaW5nJykge1xuICAgICAgaWYgKCFvLmZpbGVuYW1lKSBvLmZpbGVuYW1lID0gZmlsZTtcbiAgICAgIGRlYnVnKCdjcmVhdGluZyBgZnMuUmVhZFN0cmVhbWAgaW5zdGFuY2UgZm9yIGZpbGU6ICVzJywgZmlsZSk7XG4gICAgICBmaWxlID0gZnMuY3JlYXRlUmVhZFN0cmVhbShmaWxlKTtcbiAgICAgIGZpbGUub24oJ2Vycm9yJywgKGVycm9yKSA9PiB7XG4gICAgICAgIGNvbnN0IGZvcm1EYXRhID0gdGhpcy5fZ2V0Rm9ybURhdGEoKTtcbiAgICAgICAgZm9ybURhdGEuZW1pdCgnZXJyb3InLCBlcnJvcik7XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKCFvLmZpbGVuYW1lICYmIGZpbGUucGF0aCkge1xuICAgICAgby5maWxlbmFtZSA9IGZpbGUucGF0aDtcbiAgICB9XG5cbiAgICB0aGlzLl9nZXRGb3JtRGF0YSgpLmFwcGVuZChmaWVsZCwgZmlsZSwgbyk7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cblJlcXVlc3QucHJvdG90eXBlLl9nZXRGb3JtRGF0YSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKCF0aGlzLl9mb3JtRGF0YSkge1xuICAgIHRoaXMuX2Zvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG4gICAgdGhpcy5fZm9ybURhdGEub24oJ2Vycm9yJywgKGVycm9yKSA9PiB7XG4gICAgICBkZWJ1ZygnRm9ybURhdGEgZXJyb3InLCBlcnJvcik7XG4gICAgICBpZiAodGhpcy5jYWxsZWQpIHtcbiAgICAgICAgLy8gVGhlIHJlcXVlc3QgaGFzIGFscmVhZHkgZmluaXNoZWQgYW5kIHRoZSBjYWxsYmFjayB3YXMgY2FsbGVkLlxuICAgICAgICAvLyBTaWxlbnRseSBpZ25vcmUgdGhlIGVycm9yLlxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMuY2FsbGJhY2soZXJyb3IpO1xuICAgICAgdGhpcy5hYm9ydCgpO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuX2Zvcm1EYXRhO1xufTtcblxuLyoqXG4gKiBHZXRzL3NldHMgdGhlIGBBZ2VudGAgdG8gdXNlIGZvciB0aGlzIEhUVFAgcmVxdWVzdC4gVGhlIGRlZmF1bHQgKGlmIHRoaXNcbiAqIGZ1bmN0aW9uIGlzIG5vdCBjYWxsZWQpIGlzIHRvIG9wdCBvdXQgb2YgY29ubmVjdGlvbiBwb29saW5nIChgYWdlbnQ6IGZhbHNlYCkuXG4gKlxuICogQHBhcmFtIHtodHRwLkFnZW50fSBhZ2VudFxuICogQHJldHVybiB7aHR0cC5BZ2VudH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYWdlbnQgPSBmdW5jdGlvbiAoYWdlbnQpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHJldHVybiB0aGlzLl9hZ2VudDtcbiAgdGhpcy5fYWdlbnQgPSBhZ2VudDtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEdldHMvc2V0cyB0aGUgYGxvb2t1cGAgZnVuY3Rpb24gdG8gdXNlIGN1c3RvbSBETlMgcmVzb2x2ZXIuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gbG9va3VwXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUubG9va3VwID0gZnVuY3Rpb24gKGxvb2t1cCkge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHRoaXMuX2xvb2t1cDtcbiAgdGhpcy5fbG9va3VwID0gbG9va3VwO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IF9Db250ZW50LVR5cGVfIHJlc3BvbnNlIGhlYWRlciBwYXNzZWQgdGhyb3VnaCBgbWltZS5nZXRUeXBlKClgLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgcmVxdWVzdC5wb3N0KCcvJylcbiAqICAgICAgICAudHlwZSgneG1sJylcbiAqICAgICAgICAuc2VuZCh4bWxzdHJpbmcpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogICAgICByZXF1ZXN0LnBvc3QoJy8nKVxuICogICAgICAgIC50eXBlKCdqc29uJylcbiAqICAgICAgICAuc2VuZChqc29uc3RyaW5nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqICAgICAgcmVxdWVzdC5wb3N0KCcvJylcbiAqICAgICAgICAudHlwZSgnYXBwbGljYXRpb24vanNvbicpXG4gKiAgICAgICAgLnNlbmQoanNvbnN0cmluZylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnR5cGUgPSBmdW5jdGlvbiAodHlwZSkge1xuICByZXR1cm4gdGhpcy5zZXQoXG4gICAgJ0NvbnRlbnQtVHlwZScsXG4gICAgdHlwZS5pbmNsdWRlcygnLycpID8gdHlwZSA6IG1pbWUuZ2V0VHlwZSh0eXBlKVxuICApO1xufTtcblxuLyoqXG4gKiBTZXQgX0FjY2VwdF8gcmVzcG9uc2UgaGVhZGVyIHBhc3NlZCB0aHJvdWdoIGBtaW1lLmdldFR5cGUoKWAuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICBzdXBlcmFnZW50LnR5cGVzLmpzb24gPSAnYXBwbGljYXRpb24vanNvbic7XG4gKlxuICogICAgICByZXF1ZXN0LmdldCgnL2FnZW50JylcbiAqICAgICAgICAuYWNjZXB0KCdqc29uJylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvYWdlbnQnKVxuICogICAgICAgIC5hY2NlcHQoJ2FwcGxpY2F0aW9uL2pzb24nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBhY2NlcHRcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hY2NlcHQgPSBmdW5jdGlvbiAodHlwZSkge1xuICByZXR1cm4gdGhpcy5zZXQoJ0FjY2VwdCcsIHR5cGUuaW5jbHVkZXMoJy8nKSA/IHR5cGUgOiBtaW1lLmdldFR5cGUodHlwZSkpO1xufTtcblxuLyoqXG4gKiBBZGQgcXVlcnktc3RyaW5nIGB2YWxgLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgcmVxdWVzdC5nZXQoJy9zaG9lcycpXG4gKiAgICAgLnF1ZXJ5KCdzaXplPTEwJylcbiAqICAgICAucXVlcnkoeyBjb2xvcjogJ2JsdWUnIH0pXG4gKlxuICogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSB2YWxcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5xdWVyeSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHRoaXMuX3F1ZXJ5LnB1c2godmFsdWUpO1xuICB9IGVsc2Uge1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5xcywgdmFsdWUpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFdyaXRlIHJhdyBgZGF0YWAgLyBgZW5jb2RpbmdgIHRvIHRoZSBzb2NrZXQuXG4gKlxuICogQHBhcmFtIHtCdWZmZXJ8U3RyaW5nfSBkYXRhXG4gKiBAcGFyYW0ge1N0cmluZ30gZW5jb2RpbmdcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gKGRhdGEsIGVuY29kaW5nKSB7XG4gIGNvbnN0IHJlcXVlc3RfID0gdGhpcy5yZXF1ZXN0KCk7XG4gIGlmICghdGhpcy5fc3RyZWFtUmVxdWVzdCkge1xuICAgIHRoaXMuX3N0cmVhbVJlcXVlc3QgPSB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIHJlcXVlc3RfLndyaXRlKGRhdGEsIGVuY29kaW5nKTtcbn07XG5cbi8qKlxuICogUGlwZSB0aGUgcmVxdWVzdCBib2R5IHRvIGBzdHJlYW1gLlxuICpcbiAqIEBwYXJhbSB7U3RyZWFtfSBzdHJlYW1cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtTdHJlYW19XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnBpcGUgPSBmdW5jdGlvbiAoc3RyZWFtLCBvcHRpb25zKSB7XG4gIHRoaXMucGlwZWQgPSB0cnVlOyAvLyBIQUNLLi4uXG4gIHRoaXMuYnVmZmVyKGZhbHNlKTtcbiAgdGhpcy5lbmQoKTtcbiAgcmV0dXJuIHRoaXMuX3BpcGVDb250aW51ZShzdHJlYW0sIG9wdGlvbnMpO1xufTtcblxuUmVxdWVzdC5wcm90b3R5cGUuX3BpcGVDb250aW51ZSA9IGZ1bmN0aW9uIChzdHJlYW0sIG9wdGlvbnMpIHtcbiAgdGhpcy5yZXEub25jZSgncmVzcG9uc2UnLCAocmVzKSA9PiB7XG4gICAgLy8gcmVkaXJlY3RcbiAgICBpZiAoXG4gICAgICBpc1JlZGlyZWN0KHJlcy5zdGF0dXNDb2RlKSAmJlxuICAgICAgdGhpcy5fcmVkaXJlY3RzKysgIT09IHRoaXMuX21heFJlZGlyZWN0c1xuICAgICkge1xuICAgICAgcmV0dXJuIHRoaXMuX3JlZGlyZWN0KHJlcykgPT09IHRoaXNcbiAgICAgICAgPyB0aGlzLl9waXBlQ29udGludWUoc3RyZWFtLCBvcHRpb25zKVxuICAgICAgICA6IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICB0aGlzLnJlcyA9IHJlcztcbiAgICB0aGlzLl9lbWl0UmVzcG9uc2UoKTtcbiAgICBpZiAodGhpcy5fYWJvcnRlZCkgcmV0dXJuO1xuXG4gICAgaWYgKHRoaXMuX3Nob3VsZERlY29tcHJlc3MocmVzKSkge1xuXG4gICAgICBsZXQgZGVjb21wcmVzc2VyID0gY2hvb3NlRGVjb21wcmVzc2VyKHJlcyk7XG5cbiAgICAgIGRlY29tcHJlc3Nlci5vbignZXJyb3InLCAoZXJyb3IpID0+IHtcbiAgICAgICAgaWYgKGVycm9yICYmIGVycm9yLmNvZGUgPT09ICdaX0JVRl9FUlJPUicpIHtcbiAgICAgICAgICAvLyB1bmV4cGVjdGVkIGVuZCBvZiBmaWxlIGlzIGlnbm9yZWQgYnkgYnJvd3NlcnMgYW5kIGN1cmxcbiAgICAgICAgICBzdHJlYW0uZW1pdCgnZW5kJyk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RyZWFtLmVtaXQoJ2Vycm9yJywgZXJyb3IpO1xuICAgICAgfSk7XG4gICAgICByZXMucGlwZShkZWNvbXByZXNzZXIpLnBpcGUoc3RyZWFtLCBvcHRpb25zKTtcbiAgICAgIC8vIGRvbid0IGVtaXQgJ2VuZCcgdW50aWwgZGVjb21wcmVzc2VyIGhhcyBjb21wbGV0ZWQgd3JpdGluZyBhbGwgaXRzIGRhdGEuXG4gICAgICBkZWNvbXByZXNzZXIub25jZSgnZW5kJywgKCkgPT4gdGhpcy5lbWl0KCdlbmQnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlcy5waXBlKHN0cmVhbSwgb3B0aW9ucyk7XG4gICAgICByZXMub25jZSgnZW5kJywgKCkgPT4gdGhpcy5lbWl0KCdlbmQnKSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHN0cmVhbTtcbn07XG5cbi8qKlxuICogRW5hYmxlIC8gZGlzYWJsZSBidWZmZXJpbmcuXG4gKlxuICogQHJldHVybiB7Qm9vbGVhbn0gW3ZhbF1cbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5idWZmZXIgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgdGhpcy5fYnVmZmVyID0gdmFsdWUgIT09IGZhbHNlO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVkaXJlY3QgdG8gYHVybFxuICpcbiAqIEBwYXJhbSB7SW5jb21pbmdNZXNzYWdlfSByZXNcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuX3JlZGlyZWN0ID0gZnVuY3Rpb24gKHJlcykge1xuICBsZXQgdXJsID0gcmVzLmhlYWRlcnMubG9jYXRpb247XG4gIGlmICghdXJsKSB7XG4gICAgcmV0dXJuIHRoaXMuY2FsbGJhY2sobmV3IEVycm9yKCdObyBsb2NhdGlvbiBoZWFkZXIgZm9yIHJlZGlyZWN0JyksIHJlcyk7XG4gIH1cblxuICBkZWJ1ZygncmVkaXJlY3QgJXMgLT4gJXMnLCB0aGlzLnVybCwgdXJsKTtcblxuICAvLyBsb2NhdGlvblxuICB1cmwgPSBuZXcgVVJMKHVybCwgdGhpcy51cmwpLmhyZWY7XG5cbiAgLy8gZW5zdXJlIHRoZSByZXNwb25zZSBpcyBiZWluZyBjb25zdW1lZFxuICAvLyB0aGlzIGlzIHJlcXVpcmVkIGZvciBOb2RlIHYwLjEwK1xuICByZXMucmVzdW1lKCk7XG5cbiAgbGV0IGhlYWRlcnMgPSB0aGlzLnJlcS5nZXRIZWFkZXJzID8gdGhpcy5yZXEuZ2V0SGVhZGVycygpIDogdGhpcy5yZXEuX2hlYWRlcnM7XG5cbiAgY29uc3QgY2hhbmdlc09yaWdpbiA9IG5ldyBVUkwodXJsKS5ob3N0ICE9PSBuZXcgVVJMKHRoaXMudXJsKS5ob3N0O1xuXG4gIC8vIGltcGxlbWVudGF0aW9uIG9mIDMwMiBmb2xsb3dpbmcgZGVmYWN0byBzdGFuZGFyZFxuICBpZiAocmVzLnN0YXR1c0NvZGUgPT09IDMwMSB8fCByZXMuc3RhdHVzQ29kZSA9PT0gMzAyKSB7XG4gICAgLy8gc3RyaXAgQ29udGVudC0qIHJlbGF0ZWQgZmllbGRzXG4gICAgLy8gaW4gY2FzZSBvZiBQT1NUIGV0Y1xuICAgIGhlYWRlcnMgPSB1dGlscy5jbGVhbkhlYWRlcihoZWFkZXJzLCBjaGFuZ2VzT3JpZ2luKTtcblxuICAgIC8vIGZvcmNlIEdFVFxuICAgIHRoaXMubWV0aG9kID0gdGhpcy5tZXRob2QgPT09ICdIRUFEJyA/ICdIRUFEJyA6ICdHRVQnO1xuXG4gICAgLy8gY2xlYXIgZGF0YVxuICAgIHRoaXMuX2RhdGEgPSBudWxsO1xuICB9XG5cbiAgLy8gMzAzIGlzIGFsd2F5cyBHRVRcbiAgaWYgKHJlcy5zdGF0dXNDb2RlID09PSAzMDMpIHtcbiAgICAvLyBzdHJpcCBDb250ZW50LSogcmVsYXRlZCBmaWVsZHNcbiAgICAvLyBpbiBjYXNlIG9mIFBPU1QgZXRjXG4gICAgaGVhZGVycyA9IHV0aWxzLmNsZWFuSGVhZGVyKGhlYWRlcnMsIGNoYW5nZXNPcmlnaW4pO1xuXG4gICAgLy8gZm9yY2UgbWV0aG9kXG4gICAgdGhpcy5tZXRob2QgPSAnR0VUJztcblxuICAgIC8vIGNsZWFyIGRhdGFcbiAgICB0aGlzLl9kYXRhID0gbnVsbDtcbiAgfVxuXG4gIC8vIDMwNyBwcmVzZXJ2ZXMgbWV0aG9kXG4gIC8vIDMwOCBwcmVzZXJ2ZXMgbWV0aG9kXG4gIGRlbGV0ZSBoZWFkZXJzLmhvc3Q7XG5cbiAgZGVsZXRlIHRoaXMucmVxO1xuICBkZWxldGUgdGhpcy5fZm9ybURhdGE7XG5cbiAgLy8gcmVtb3ZlIGFsbCBhZGQgaGVhZGVyIGV4Y2VwdCBVc2VyLUFnZW50XG4gIF9pbml0SGVhZGVycyh0aGlzKTtcblxuICAvLyByZWRpcmVjdFxuICB0aGlzLnJlcyA9IHJlcztcbiAgdGhpcy5fZW5kQ2FsbGVkID0gZmFsc2U7XG4gIHRoaXMudXJsID0gdXJsO1xuICB0aGlzLnFzID0ge307XG4gIHRoaXMuX3F1ZXJ5Lmxlbmd0aCA9IDA7XG4gIHRoaXMuc2V0KGhlYWRlcnMpO1xuICB0aGlzLl9lbWl0UmVkaXJlY3QoKTtcbiAgdGhpcy5fcmVkaXJlY3RMaXN0LnB1c2godGhpcy51cmwpO1xuICB0aGlzLmVuZCh0aGlzLl9jYWxsYmFjayk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgQXV0aG9yaXphdGlvbiBmaWVsZCB2YWx1ZSB3aXRoIGB1c2VyYCBhbmQgYHBhc3NgLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgLmF1dGgoJ3RvYmknLCAnbGVhcm5ib29zdCcpXG4gKiAgIC5hdXRoKCd0b2JpOmxlYXJuYm9vc3QnKVxuICogICAuYXV0aCgndG9iaScpXG4gKiAgIC5hdXRoKGFjY2Vzc1Rva2VuLCB7IHR5cGU6ICdiZWFyZXInIH0pXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVzZXJcbiAqIEBwYXJhbSB7U3RyaW5nfSBbcGFzc11cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gb3B0aW9ucyB3aXRoIGF1dGhvcml6YXRpb24gdHlwZSAnYmFzaWMnIG9yICdiZWFyZXInICgnYmFzaWMnIGlzIGRlZmF1bHQpXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYXV0aCA9IGZ1bmN0aW9uICh1c2VyLCBwYXNzLCBvcHRpb25zKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSBwYXNzID0gJyc7XG4gIGlmICh0eXBlb2YgcGFzcyA9PT0gJ29iamVjdCcgJiYgcGFzcyAhPT0gbnVsbCkge1xuICAgIC8vIHBhc3MgaXMgb3B0aW9uYWwgYW5kIGNhbiBiZSByZXBsYWNlZCB3aXRoIG9wdGlvbnNcbiAgICBvcHRpb25zID0gcGFzcztcbiAgICBwYXNzID0gJyc7XG4gIH1cblxuICBpZiAoIW9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0geyB0eXBlOiAnYmFzaWMnIH07XG4gIH1cblxuICBjb25zdCBlbmNvZGVyID0gKHN0cmluZykgPT4gQnVmZmVyLmZyb20oc3RyaW5nKS50b1N0cmluZygnYmFzZTY0Jyk7XG5cbiAgcmV0dXJuIHRoaXMuX2F1dGgodXNlciwgcGFzcywgb3B0aW9ucywgZW5jb2Rlcik7XG59O1xuXG4vKipcbiAqIFNldCB0aGUgY2VydGlmaWNhdGUgYXV0aG9yaXR5IG9wdGlvbiBmb3IgaHR0cHMgcmVxdWVzdC5cbiAqXG4gKiBAcGFyYW0ge0J1ZmZlciB8IEFycmF5fSBjZXJ0XG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY2EgPSBmdW5jdGlvbiAoY2VydCkge1xuICB0aGlzLl9jYSA9IGNlcnQ7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgdGhlIGNsaWVudCBjZXJ0aWZpY2F0ZSBrZXkgb3B0aW9uIGZvciBodHRwcyByZXF1ZXN0LlxuICpcbiAqIEBwYXJhbSB7QnVmZmVyIHwgU3RyaW5nfSBjZXJ0XG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUua2V5ID0gZnVuY3Rpb24gKGNlcnQpIHtcbiAgdGhpcy5fa2V5ID0gY2VydDtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCB0aGUga2V5LCBjZXJ0aWZpY2F0ZSwgYW5kIENBIGNlcnRzIG9mIHRoZSBjbGllbnQgaW4gUEZYIG9yIFBLQ1MxMiBmb3JtYXQuXG4gKlxuICogQHBhcmFtIHtCdWZmZXIgfCBTdHJpbmd9IGNlcnRcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5wZnggPSBmdW5jdGlvbiAoY2VydCkge1xuICBpZiAodHlwZW9mIGNlcnQgPT09ICdvYmplY3QnICYmICFCdWZmZXIuaXNCdWZmZXIoY2VydCkpIHtcbiAgICB0aGlzLl9wZnggPSBjZXJ0LnBmeDtcbiAgICB0aGlzLl9wYXNzcGhyYXNlID0gY2VydC5wYXNzcGhyYXNlO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuX3BmeCA9IGNlcnQ7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IHRoZSBjbGllbnQgY2VydGlmaWNhdGUgb3B0aW9uIGZvciBodHRwcyByZXF1ZXN0LlxuICpcbiAqIEBwYXJhbSB7QnVmZmVyIHwgU3RyaW5nfSBjZXJ0XG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY2VydCA9IGZ1bmN0aW9uIChjZXJ0KSB7XG4gIHRoaXMuX2NlcnQgPSBjZXJ0O1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRG8gbm90IHJlamVjdCBleHBpcmVkIG9yIGludmFsaWQgVExTIGNlcnRzLlxuICogc2V0cyBgcmVqZWN0VW5hdXRob3JpemVkPXRydWVgLiBCZSB3YXJuZWQgdGhhdCB0aGlzIGFsbG93cyBNSVRNIGF0dGFja3MuXG4gKlxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmRpc2FibGVUTFNDZXJ0cyA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5fZGlzYWJsZVRMU0NlcnRzID0gdHJ1ZTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJldHVybiBhbiBodHRwW3NdIHJlcXVlc3QuXG4gKlxuICogQHJldHVybiB7T3V0Z29pbmdNZXNzYWdlfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNvbXBsZXhpdHlcblJlcXVlc3QucHJvdG90eXBlLnJlcXVlc3QgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLnJlcSkgcmV0dXJuIHRoaXMucmVxO1xuXG4gIGNvbnN0IG9wdGlvbnMgPSB7fTtcblxuICB0cnkge1xuICAgIGNvbnN0IHF1ZXJ5ID0gcXMuc3RyaW5naWZ5KHRoaXMucXMsIHtcbiAgICAgIGluZGljZXM6IGZhbHNlLFxuICAgICAgc3RyaWN0TnVsbEhhbmRsaW5nOiB0cnVlXG4gICAgfSk7XG4gICAgaWYgKHF1ZXJ5KSB7XG4gICAgICB0aGlzLnFzID0ge307XG4gICAgICB0aGlzLl9xdWVyeS5wdXNoKHF1ZXJ5KTtcbiAgICB9XG5cbiAgICB0aGlzLl9maW5hbGl6ZVF1ZXJ5U3RyaW5nKCk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgfVxuXG4gIGxldCB7IHVybDogdXJsU3RyaW5nIH0gPSB0aGlzO1xuICBjb25zdCByZXRyaWVzID0gdGhpcy5fcmV0cmllcztcblxuICAvLyBkZWZhdWx0IHRvIGh0dHA6Ly9cbiAgaWYgKHVybFN0cmluZy5pbmRleE9mKCdodHRwJykgIT09IDApIHVybFN0cmluZyA9IGBodHRwOi8vJHt1cmxTdHJpbmd9YDtcbiAgY29uc3QgdXJsID0gbmV3IFVSTCh1cmxTdHJpbmcpO1xuICBsZXQgeyBwcm90b2NvbCB9ID0gdXJsO1xuICBsZXQgcGF0aCA9IGAke3VybC5wYXRobmFtZX0ke3VybC5zZWFyY2h9YDtcblxuICAvLyBzdXBwb3J0IHVuaXggc29ja2V0c1xuICBpZiAoL15odHRwcz9cXCt1bml4Oi8udGVzdChwcm90b2NvbCkgPT09IHRydWUpIHtcbiAgICAvLyBnZXQgdGhlIHByb3RvY29sXG4gICAgcHJvdG9jb2wgPSBgJHtwcm90b2NvbC5zcGxpdCgnKycpWzBdfTpgO1xuXG4gICAgLy8gZ2V0IHRoZSBzb2NrZXQgcGF0aFxuICAgIG9wdGlvbnMuc29ja2V0UGF0aCA9IHVybC5ob3N0bmFtZS5yZXBsYWNlKC8lMkYvZywgJy8nKTtcbiAgICB1cmwuaG9zdCA9ICcnO1xuICAgIHVybC5ob3N0bmFtZSA9ICcnO1xuICB9XG5cbiAgLy8gT3ZlcnJpZGUgSVAgYWRkcmVzcyBvZiBhIGhvc3RuYW1lXG4gIGlmICh0aGlzLl9jb25uZWN0T3ZlcnJpZGUpIHtcbiAgICBjb25zdCB7IGhvc3RuYW1lIH0gPSB1cmw7XG4gICAgY29uc3QgbWF0Y2ggPVxuICAgICAgaG9zdG5hbWUgaW4gdGhpcy5fY29ubmVjdE92ZXJyaWRlXG4gICAgICAgID8gdGhpcy5fY29ubmVjdE92ZXJyaWRlW2hvc3RuYW1lXVxuICAgICAgICA6IHRoaXMuX2Nvbm5lY3RPdmVycmlkZVsnKiddO1xuICAgIGlmIChtYXRjaCkge1xuICAgICAgLy8gYmFja3VwIHRoZSByZWFsIGhvc3RcbiAgICAgIGlmICghdGhpcy5faGVhZGVyLmhvc3QpIHtcbiAgICAgICAgdGhpcy5zZXQoJ2hvc3QnLCB1cmwuaG9zdCk7XG4gICAgICB9XG5cbiAgICAgIGxldCBuZXdIb3N0O1xuICAgICAgbGV0IG5ld1BvcnQ7XG5cbiAgICAgIGlmICh0eXBlb2YgbWF0Y2ggPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG5ld0hvc3QgPSBtYXRjaC5ob3N0O1xuICAgICAgICBuZXdQb3J0ID0gbWF0Y2gucG9ydDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld0hvc3QgPSBtYXRjaDtcbiAgICAgICAgbmV3UG9ydCA9IHVybC5wb3J0O1xuICAgICAgfVxuXG4gICAgICAvLyB3cmFwIFtpcHY2XVxuICAgICAgdXJsLmhvc3QgPSAvOi8udGVzdChuZXdIb3N0KSA/IGBbJHtuZXdIb3N0fV1gIDogbmV3SG9zdDtcbiAgICAgIGlmIChuZXdQb3J0KSB7XG4gICAgICAgIHVybC5ob3N0ICs9IGA6JHtuZXdQb3J0fWA7XG4gICAgICAgIHVybC5wb3J0ID0gbmV3UG9ydDtcbiAgICAgIH1cblxuICAgICAgdXJsLmhvc3RuYW1lID0gbmV3SG9zdDtcbiAgICB9XG4gIH1cblxuICAvLyBvcHRpb25zXG4gIG9wdGlvbnMubWV0aG9kID0gdGhpcy5tZXRob2Q7XG4gIG9wdGlvbnMucG9ydCA9IHVybC5wb3J0O1xuICBvcHRpb25zLnBhdGggPSBwYXRoO1xuICBvcHRpb25zLmhvc3QgPSB1cmwuaG9zdG5hbWU7XG4gIG9wdGlvbnMuY2EgPSB0aGlzLl9jYTtcbiAgb3B0aW9ucy5rZXkgPSB0aGlzLl9rZXk7XG4gIG9wdGlvbnMucGZ4ID0gdGhpcy5fcGZ4O1xuICBvcHRpb25zLmNlcnQgPSB0aGlzLl9jZXJ0O1xuICBvcHRpb25zLnBhc3NwaHJhc2UgPSB0aGlzLl9wYXNzcGhyYXNlO1xuICBvcHRpb25zLmFnZW50ID0gdGhpcy5fYWdlbnQ7XG4gIG9wdGlvbnMubG9va3VwID0gdGhpcy5fbG9va3VwO1xuICBvcHRpb25zLnJlamVjdFVuYXV0aG9yaXplZCA9XG4gICAgdHlwZW9mIHRoaXMuX2Rpc2FibGVUTFNDZXJ0cyA9PT0gJ2Jvb2xlYW4nXG4gICAgICA/ICF0aGlzLl9kaXNhYmxlVExTQ2VydHNcbiAgICAgIDogcHJvY2Vzcy5lbnYuTk9ERV9UTFNfUkVKRUNUX1VOQVVUSE9SSVpFRCAhPT0gJzAnO1xuXG4gIC8vIEFsbG93cyByZXF1ZXN0LmdldCgnaHR0cHM6Ly8xLjIuMy40LycpLnNldCgnSG9zdCcsICdleGFtcGxlLmNvbScpXG4gIGlmICh0aGlzLl9oZWFkZXIuaG9zdCkge1xuICAgIG9wdGlvbnMuc2VydmVybmFtZSA9IHRoaXMuX2hlYWRlci5ob3N0LnJlcGxhY2UoLzpcXGQrJC8sICcnKTtcbiAgfVxuXG4gIGlmIChcbiAgICB0aGlzLl90cnVzdExvY2FsaG9zdCAmJlxuICAgIC9eKD86bG9jYWxob3N0fDEyN1xcLjBcXC4wXFwuXFxkK3woMCo6KSs6MCoxKSQvLnRlc3QodXJsLmhvc3RuYW1lKVxuICApIHtcbiAgICBvcHRpb25zLnJlamVjdFVuYXV0aG9yaXplZCA9IGZhbHNlO1xuICB9XG5cbiAgLy8gaW5pdGlhdGUgcmVxdWVzdFxuICBjb25zdCBtb2R1bGVfID0gdGhpcy5fZW5hYmxlSHR0cDJcbiAgICA/IGV4cG9ydHMucHJvdG9jb2xzWydodHRwMjonXS5zZXRQcm90b2NvbChwcm90b2NvbClcbiAgICA6IGV4cG9ydHMucHJvdG9jb2xzW3Byb3RvY29sXTtcblxuICAvLyByZXF1ZXN0XG4gIHRoaXMucmVxID0gbW9kdWxlXy5yZXF1ZXN0KG9wdGlvbnMpO1xuICBjb25zdCB7IHJlcSB9ID0gdGhpcztcblxuICAvLyBzZXQgdGNwIG5vIGRlbGF5XG4gIHJlcS5zZXROb0RlbGF5KHRydWUpO1xuXG4gIGlmIChvcHRpb25zLm1ldGhvZCAhPT0gJ0hFQUQnKSB7XG4gICAgcmVxLnNldEhlYWRlcignQWNjZXB0LUVuY29kaW5nJywgJ2d6aXAsIGRlZmxhdGUnKTtcbiAgfVxuXG4gIHRoaXMucHJvdG9jb2wgPSBwcm90b2NvbDtcbiAgdGhpcy5ob3N0ID0gdXJsLmhvc3Q7XG5cbiAgLy8gZXhwb3NlIGV2ZW50c1xuICByZXEub25jZSgnZHJhaW4nLCAoKSA9PiB7XG4gICAgdGhpcy5lbWl0KCdkcmFpbicpO1xuICB9KTtcblxuICByZXEub24oJ2Vycm9yJywgKGVycm9yKSA9PiB7XG4gICAgLy8gZmxhZyBhYm9ydGlvbiBoZXJlIGZvciBvdXQgdGltZW91dHNcbiAgICAvLyBiZWNhdXNlIG5vZGUgd2lsbCBlbWl0IGEgZmF1eC1lcnJvciBcInNvY2tldCBoYW5nIHVwXCJcbiAgICAvLyB3aGVuIHJlcXVlc3QgaXMgYWJvcnRlZCBiZWZvcmUgYSBjb25uZWN0aW9uIGlzIG1hZGVcbiAgICBpZiAodGhpcy5fYWJvcnRlZCkgcmV0dXJuO1xuICAgIC8vIGlmIG5vdCB0aGUgc2FtZSwgd2UgYXJlIGluIHRoZSAqKm9sZCoqIChjYW5jZWxsZWQpIHJlcXVlc3QsXG4gICAgLy8gc28gbmVlZCB0byBjb250aW51ZSAoc2FtZSBhcyBmb3IgYWJvdmUpXG4gICAgaWYgKHRoaXMuX3JldHJpZXMgIT09IHJldHJpZXMpIHJldHVybjtcbiAgICAvLyBpZiB3ZSd2ZSByZWNlaXZlZCBhIHJlc3BvbnNlIHRoZW4gd2UgZG9uJ3Qgd2FudCB0byBsZXRcbiAgICAvLyBhbiBlcnJvciBpbiB0aGUgcmVxdWVzdCBibG93IHVwIHRoZSByZXNwb25zZVxuICAgIGlmICh0aGlzLnJlc3BvbnNlKSByZXR1cm47XG4gICAgdGhpcy5jYWxsYmFjayhlcnJvcik7XG4gIH0pO1xuXG4gIC8vIGF1dGhcbiAgaWYgKHVybC51c2VybmFtZSB8fCB1cmwucGFzc3dvcmQpIHtcbiAgICB0aGlzLmF1dGgodXJsLnVzZXJuYW1lLCB1cmwucGFzc3dvcmQpO1xuICB9XG5cbiAgaWYgKHRoaXMudXNlcm5hbWUgJiYgdGhpcy5wYXNzd29yZCkge1xuICAgIHRoaXMuYXV0aCh0aGlzLnVzZXJuYW1lLCB0aGlzLnBhc3N3b3JkKTtcbiAgfVxuXG4gIGZvciAoY29uc3Qga2V5IGluIHRoaXMuaGVhZGVyKSB7XG4gICAgaWYgKGhhc093bih0aGlzLmhlYWRlciwga2V5KSkgcmVxLnNldEhlYWRlcihrZXksIHRoaXMuaGVhZGVyW2tleV0pO1xuICB9XG5cbiAgLy8gYWRkIGNvb2tpZXNcbiAgaWYgKHRoaXMuY29va2llcykge1xuICAgIGlmIChoYXNPd24odGhpcy5faGVhZGVyLCAnY29va2llJykpIHtcbiAgICAgIC8vIG1lcmdlXG4gICAgICBjb25zdCB0ZW1wb3JhcnlKYXIgPSBuZXcgQ29va2llSmFyLkNvb2tpZUphcigpO1xuICAgICAgdGVtcG9yYXJ5SmFyLnNldENvb2tpZXModGhpcy5faGVhZGVyLmNvb2tpZS5zcGxpdCgnOyAnKSk7XG4gICAgICB0ZW1wb3JhcnlKYXIuc2V0Q29va2llcyh0aGlzLmNvb2tpZXMuc3BsaXQoJzsgJykpO1xuICAgICAgcmVxLnNldEhlYWRlcihcbiAgICAgICAgJ0Nvb2tpZScsXG4gICAgICAgIHRlbXBvcmFyeUphci5nZXRDb29raWVzKENvb2tpZUphci5Db29raWVBY2Nlc3NJbmZvLkFsbCkudG9WYWx1ZVN0cmluZygpXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXEuc2V0SGVhZGVyKCdDb29raWUnLCB0aGlzLmNvb2tpZXMpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIEludm9rZSB0aGUgY2FsbGJhY2sgd2l0aCBgZXJyYCBhbmQgYHJlc2BcbiAqIGFuZCBoYW5kbGUgYXJpdHkgY2hlY2suXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyXG4gKiBAcGFyYW0ge1Jlc3BvbnNlfSByZXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmNhbGxiYWNrID0gZnVuY3Rpb24gKGVycm9yLCByZXMpIHtcbiAgaWYgKHRoaXMuX3Nob3VsZFJldHJ5KGVycm9yLCByZXMpKSB7XG4gICAgcmV0dXJuIHRoaXMuX3JldHJ5KCk7XG4gIH1cblxuICAvLyBBdm9pZCB0aGUgZXJyb3Igd2hpY2ggaXMgZW1pdHRlZCBmcm9tICdzb2NrZXQgaGFuZyB1cCcgdG8gY2F1c2UgdGhlIGZuIHVuZGVmaW5lZCBlcnJvciBvbiBKUyBydW50aW1lLlxuICBjb25zdCBmbiA9IHRoaXMuX2NhbGxiYWNrIHx8IG5vb3A7XG4gIHRoaXMuY2xlYXJUaW1lb3V0KCk7XG4gIGlmICh0aGlzLmNhbGxlZCkgcmV0dXJuIGNvbnNvbGUud2Fybignc3VwZXJhZ2VudDogZG91YmxlIGNhbGxiYWNrIGJ1ZycpO1xuICB0aGlzLmNhbGxlZCA9IHRydWU7XG5cbiAgaWYgKCFlcnJvcikge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIXRoaXMuX2lzUmVzcG9uc2VPSyhyZXMpKSB7XG4gICAgICAgIGxldCBtZXNzYWdlID0gJ1Vuc3VjY2Vzc2Z1bCBIVFRQIHJlc3BvbnNlJztcbiAgICAgICAgaWYgKHJlcykge1xuICAgICAgICAgIG1lc3NhZ2UgPSBodHRwLlNUQVRVU19DT0RFU1tyZXMuc3RhdHVzXSB8fCBtZXNzYWdlO1xuICAgICAgICB9XG5cbiAgICAgICAgZXJyb3IgPSBuZXcgRXJyb3IobWVzc2FnZSk7XG4gICAgICAgIGVycm9yLnN0YXR1cyA9IHJlcyA/IHJlcy5zdGF0dXMgOiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBlcnJvciA9IGVycjtcbiAgICAgIGVycm9yLnN0YXR1cyA9IGVycm9yLnN0YXR1cyB8fCAocmVzID8gcmVzLnN0YXR1cyA6IHVuZGVmaW5lZCk7XG4gICAgfVxuICB9XG5cbiAgLy8gSXQncyBpbXBvcnRhbnQgdGhhdCB0aGUgY2FsbGJhY2sgaXMgY2FsbGVkIG91dHNpZGUgdHJ5L2NhdGNoXG4gIC8vIHRvIGF2b2lkIGRvdWJsZSBjYWxsYmFja1xuICBpZiAoIWVycm9yKSB7XG4gICAgcmV0dXJuIGZuKG51bGwsIHJlcyk7XG4gIH1cblxuICBlcnJvci5yZXNwb25zZSA9IHJlcztcbiAgaWYgKHRoaXMuX21heFJldHJpZXMpIGVycm9yLnJldHJpZXMgPSB0aGlzLl9yZXRyaWVzIC0gMTtcblxuICAvLyBvbmx5IGVtaXQgZXJyb3IgZXZlbnQgaWYgdGhlcmUgaXMgYSBsaXN0ZW5lclxuICAvLyBvdGhlcndpc2Ugd2UgYXNzdW1lIHRoZSBjYWxsYmFjayB0byBgLmVuZCgpYCB3aWxsIGdldCB0aGUgZXJyb3JcbiAgaWYgKGVycm9yICYmIHRoaXMubGlzdGVuZXJzKCdlcnJvcicpLmxlbmd0aCA+IDApIHtcbiAgICB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyb3IpO1xuICB9XG5cbiAgZm4oZXJyb3IsIHJlcyk7XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIGBvYmpgIGlzIGEgaG9zdCBvYmplY3QsXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBob3N0IG9iamVjdFxuICogQHJldHVybiB7Qm9vbGVhbn0gaXMgYSBob3N0IG9iamVjdFxuICogQGFwaSBwcml2YXRlXG4gKi9cblJlcXVlc3QucHJvdG90eXBlLl9pc0hvc3QgPSBmdW5jdGlvbiAob2JqZWN0KSB7XG4gIHJldHVybiAoXG4gICAgQnVmZmVyLmlzQnVmZmVyKG9iamVjdCkgfHxcbiAgICBvYmplY3QgaW5zdGFuY2VvZiBTdHJlYW0gfHxcbiAgICBvYmplY3QgaW5zdGFuY2VvZiBGb3JtRGF0YVxuICApO1xufTtcblxuLyoqXG4gKiBJbml0aWF0ZSByZXF1ZXN0LCBpbnZva2luZyBjYWxsYmFjayBgZm4oZXJyLCByZXMpYFxuICogd2l0aCBhbiBpbnN0YW5jZW9mIGBSZXNwb25zZWAuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5fZW1pdFJlc3BvbnNlID0gZnVuY3Rpb24gKGJvZHksIGZpbGVzKSB7XG4gIGNvbnN0IHJlc3BvbnNlID0gbmV3IFJlc3BvbnNlKHRoaXMpO1xuICB0aGlzLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gIHJlc3BvbnNlLnJlZGlyZWN0cyA9IHRoaXMuX3JlZGlyZWN0TGlzdDtcbiAgaWYgKHVuZGVmaW5lZCAhPT0gYm9keSkge1xuICAgIHJlc3BvbnNlLmJvZHkgPSBib2R5O1xuICB9XG5cbiAgcmVzcG9uc2UuZmlsZXMgPSBmaWxlcztcbiAgaWYgKHRoaXMuX2VuZENhbGxlZCkge1xuICAgIHJlc3BvbnNlLnBpcGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIFwiZW5kKCkgaGFzIGFscmVhZHkgYmVlbiBjYWxsZWQsIHNvIGl0J3MgdG9vIGxhdGUgdG8gc3RhcnQgcGlwaW5nXCJcbiAgICAgICk7XG4gICAgfTtcbiAgfVxuXG4gIHRoaXMuZW1pdCgncmVzcG9uc2UnLCByZXNwb25zZSk7XG4gIHJldHVybiByZXNwb25zZTtcbn07XG5cbi8qKlxuICogRW1pdCBgcmVkaXJlY3RgIGV2ZW50LCBwYXNzaW5nIGFuIGluc3RhbmNlb2YgYFJlc3BvbnNlYC5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5fZW1pdFJlZGlyZWN0ID0gZnVuY3Rpb24gKCkge1xuICBjb25zdCByZXNwb25zZSA9IG5ldyBSZXNwb25zZSh0aGlzKTtcbiAgcmVzcG9uc2UucmVkaXJlY3RzID0gdGhpcy5fcmVkaXJlY3RMaXN0O1xuICB0aGlzLmVtaXQoJ3JlZGlyZWN0JywgcmVzcG9uc2UpO1xufTtcblxuUmVxdWVzdC5wcm90b3R5cGUuZW5kID0gZnVuY3Rpb24gKGZuKSB7XG4gIHRoaXMucmVxdWVzdCgpO1xuICBkZWJ1ZygnJXMgJXMnLCB0aGlzLm1ldGhvZCwgdGhpcy51cmwpO1xuXG4gIGlmICh0aGlzLl9lbmRDYWxsZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAnLmVuZCgpIHdhcyBjYWxsZWQgdHdpY2UuIFRoaXMgaXMgbm90IHN1cHBvcnRlZCBpbiBzdXBlcmFnZW50J1xuICAgICk7XG4gIH1cblxuICB0aGlzLl9lbmRDYWxsZWQgPSB0cnVlO1xuXG4gIC8vIHN0b3JlIGNhbGxiYWNrXG4gIHRoaXMuX2NhbGxiYWNrID0gZm4gfHwgbm9vcDtcblxuICB0aGlzLl9lbmQoKTtcbn07XG5cblJlcXVlc3QucHJvdG90eXBlLl9lbmQgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLl9hYm9ydGVkKVxuICAgIHJldHVybiB0aGlzLmNhbGxiYWNrKFxuICAgICAgbmV3IEVycm9yKCdUaGUgcmVxdWVzdCBoYXMgYmVlbiBhYm9ydGVkIGV2ZW4gYmVmb3JlIC5lbmQoKSB3YXMgY2FsbGVkJylcbiAgICApO1xuXG4gIGxldCBkYXRhID0gdGhpcy5fZGF0YTtcbiAgY29uc3QgeyByZXEgfSA9IHRoaXM7XG4gIGNvbnN0IHsgbWV0aG9kIH0gPSB0aGlzO1xuXG4gIHRoaXMuX3NldFRpbWVvdXRzKCk7XG5cbiAgLy8gYm9keVxuICBpZiAobWV0aG9kICE9PSAnSEVBRCcgJiYgIXJlcS5faGVhZGVyU2VudCkge1xuICAgIC8vIHNlcmlhbGl6ZSBzdHVmZlxuICAgIGlmICh0eXBlb2YgZGF0YSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIGxldCBjb250ZW50VHlwZSA9IHJlcS5nZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScpO1xuICAgICAgLy8gUGFyc2Ugb3V0IGp1c3QgdGhlIGNvbnRlbnQgdHlwZSBmcm9tIHRoZSBoZWFkZXIgKGlnbm9yZSB0aGUgY2hhcnNldClcbiAgICAgIGlmIChjb250ZW50VHlwZSkgY29udGVudFR5cGUgPSBjb250ZW50VHlwZS5zcGxpdCgnOycpWzBdO1xuICAgICAgbGV0IHNlcmlhbGl6ZSA9IHRoaXMuX3NlcmlhbGl6ZXIgfHwgZXhwb3J0cy5zZXJpYWxpemVbY29udGVudFR5cGVdO1xuICAgICAgaWYgKCFzZXJpYWxpemUgJiYgaXNKU09OKGNvbnRlbnRUeXBlKSkge1xuICAgICAgICBzZXJpYWxpemUgPSBleHBvcnRzLnNlcmlhbGl6ZVsnYXBwbGljYXRpb24vanNvbiddO1xuICAgICAgfVxuXG4gICAgICBpZiAoc2VyaWFsaXplKSBkYXRhID0gc2VyaWFsaXplKGRhdGEpO1xuICAgIH1cblxuICAgIC8vIGNvbnRlbnQtbGVuZ3RoXG4gICAgaWYgKGRhdGEgJiYgIXJlcS5nZXRIZWFkZXIoJ0NvbnRlbnQtTGVuZ3RoJykpIHtcbiAgICAgIHJlcS5zZXRIZWFkZXIoXG4gICAgICAgICdDb250ZW50LUxlbmd0aCcsXG4gICAgICAgIEJ1ZmZlci5pc0J1ZmZlcihkYXRhKSA/IGRhdGEubGVuZ3RoIDogQnVmZmVyLmJ5dGVMZW5ndGgoZGF0YSlcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLy8gcmVzcG9uc2VcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNvbXBsZXhpdHlcbiAgcmVxLm9uY2UoJ3Jlc3BvbnNlJywgKHJlcykgPT4ge1xuICAgIGRlYnVnKCclcyAlcyAtPiAlcycsIHRoaXMubWV0aG9kLCB0aGlzLnVybCwgcmVzLnN0YXR1c0NvZGUpO1xuXG4gICAgaWYgKHRoaXMuX3Jlc3BvbnNlVGltZW91dFRpbWVyKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fcmVzcG9uc2VUaW1lb3V0VGltZXIpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnBpcGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbWF4ID0gdGhpcy5fbWF4UmVkaXJlY3RzO1xuICAgIGNvbnN0IG1pbWUgPSB1dGlscy50eXBlKHJlcy5oZWFkZXJzWydjb250ZW50LXR5cGUnXSB8fCAnJykgfHwgJ3RleHQvcGxhaW4nO1xuICAgIGxldCB0eXBlID0gbWltZS5zcGxpdCgnLycpWzBdO1xuICAgIGlmICh0eXBlKSB0eXBlID0gdHlwZS50b0xvd2VyQ2FzZSgpLnRyaW0oKTtcbiAgICBjb25zdCBtdWx0aXBhcnQgPSB0eXBlID09PSAnbXVsdGlwYXJ0JztcbiAgICBjb25zdCByZWRpcmVjdCA9IGlzUmVkaXJlY3QocmVzLnN0YXR1c0NvZGUpO1xuICAgIGNvbnN0IHJlc3BvbnNlVHlwZSA9IHRoaXMuX3Jlc3BvbnNlVHlwZTtcblxuICAgIHRoaXMucmVzID0gcmVzO1xuXG4gICAgLy8gcmVkaXJlY3RcbiAgICBpZiAocmVkaXJlY3QgJiYgdGhpcy5fcmVkaXJlY3RzKysgIT09IG1heCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3JlZGlyZWN0KHJlcyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMubWV0aG9kID09PSAnSEVBRCcpIHtcbiAgICAgIHRoaXMuZW1pdCgnZW5kJyk7XG4gICAgICB0aGlzLmNhbGxiYWNrKG51bGwsIHRoaXMuX2VtaXRSZXNwb25zZSgpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyB6bGliIHN1cHBvcnRcbiAgICBpZiAodGhpcy5fc2hvdWxkRGVjb21wcmVzcyhyZXMpKSB7XG4gICAgICBkZWNvbXByZXNzKHJlcSwgcmVzKTtcbiAgICB9XG5cbiAgICBsZXQgYnVmZmVyID0gdGhpcy5fYnVmZmVyO1xuICAgIGlmIChidWZmZXIgPT09IHVuZGVmaW5lZCAmJiBtaW1lIGluIGV4cG9ydHMuYnVmZmVyKSB7XG4gICAgICBidWZmZXIgPSBCb29sZWFuKGV4cG9ydHMuYnVmZmVyW21pbWVdKTtcbiAgICB9XG5cbiAgICBsZXQgcGFyc2VyID0gdGhpcy5fcGFyc2VyO1xuICAgIGlmICh1bmRlZmluZWQgPT09IGJ1ZmZlciAmJiBwYXJzZXIpIHtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgXCJBIGN1c3RvbSBzdXBlcmFnZW50IHBhcnNlciBoYXMgYmVlbiBzZXQsIGJ1dCBidWZmZXJpbmcgc3RyYXRlZ3kgZm9yIHRoZSBwYXJzZXIgaGFzbid0IGJlZW4gY29uZmlndXJlZC4gQ2FsbCBgcmVxLmJ1ZmZlcih0cnVlIG9yIGZhbHNlKWAgb3Igc2V0IGBzdXBlcmFnZW50LmJ1ZmZlclttaW1lXSA9IHRydWUgb3IgZmFsc2VgXCJcbiAgICAgICk7XG4gICAgICBidWZmZXIgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmICghcGFyc2VyKSB7XG4gICAgICBpZiAocmVzcG9uc2VUeXBlKSB7XG4gICAgICAgIHBhcnNlciA9IGV4cG9ydHMucGFyc2UuaW1hZ2U7IC8vIEl0J3MgYWN0dWFsbHkgYSBnZW5lcmljIEJ1ZmZlclxuICAgICAgICBidWZmZXIgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmIChtdWx0aXBhcnQpIHtcbiAgICAgICAgY29uc3QgZm9ybSA9IGZvcm1pZGFibGUuZm9ybWlkYWJsZSgpO1xuICAgICAgICBwYXJzZXIgPSBmb3JtLnBhcnNlLmJpbmQoZm9ybSk7XG4gICAgICAgIGJ1ZmZlciA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKGlzQmluYXJ5KG1pbWUpKSB7XG4gICAgICAgIHBhcnNlciA9IGV4cG9ydHMucGFyc2UuaW1hZ2U7XG4gICAgICAgIGJ1ZmZlciA9IHRydWU7IC8vIEZvciBiYWNrd2FyZHMtY29tcGF0aWJpbGl0eSBidWZmZXJpbmcgZGVmYXVsdCBpcyBhZC1ob2MgTUlNRS1kZXBlbmRlbnRcbiAgICAgIH0gZWxzZSBpZiAoZXhwb3J0cy5wYXJzZVttaW1lXSkge1xuICAgICAgICBwYXJzZXIgPSBleHBvcnRzLnBhcnNlW21pbWVdO1xuICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAndGV4dCcpIHtcbiAgICAgICAgcGFyc2VyID0gZXhwb3J0cy5wYXJzZS50ZXh0O1xuICAgICAgICBidWZmZXIgPSBidWZmZXIgIT09IGZhbHNlO1xuICAgICAgICAvLyBldmVyeW9uZSB3YW50cyB0aGVpciBvd24gd2hpdGUtbGFiZWxlZCBqc29uXG4gICAgICB9IGVsc2UgaWYgKGlzSlNPTihtaW1lKSkge1xuICAgICAgICBwYXJzZXIgPSBleHBvcnRzLnBhcnNlWydhcHBsaWNhdGlvbi9qc29uJ107XG4gICAgICAgIGJ1ZmZlciA9IGJ1ZmZlciAhPT0gZmFsc2U7XG4gICAgICB9IGVsc2UgaWYgKGJ1ZmZlcikge1xuICAgICAgICBwYXJzZXIgPSBleHBvcnRzLnBhcnNlLnRleHQ7XG4gICAgICB9IGVsc2UgaWYgKHVuZGVmaW5lZCA9PT0gYnVmZmVyKSB7XG4gICAgICAgIHBhcnNlciA9IGV4cG9ydHMucGFyc2UuaW1hZ2U7IC8vIEl0J3MgYWN0dWFsbHkgYSBnZW5lcmljIEJ1ZmZlclxuICAgICAgICBidWZmZXIgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGJ5IGRlZmF1bHQgb25seSBidWZmZXIgdGV4dC8qLCBqc29uIGFuZCBtZXNzZWQgdXAgdGhpbmcgZnJvbSBoZWxsXG4gICAgaWYgKCh1bmRlZmluZWQgPT09IGJ1ZmZlciAmJiBpc1RleHQobWltZSkpIHx8IGlzSlNPTihtaW1lKSkge1xuICAgICAgYnVmZmVyID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB0aGlzLl9yZXNCdWZmZXJlZCA9IGJ1ZmZlcjtcbiAgICBsZXQgcGFyc2VySGFuZGxlc0VuZCA9IGZhbHNlO1xuICAgIGlmIChidWZmZXIpIHtcbiAgICAgIC8vIFByb3RlY3Rpb25hIGFnYWluc3QgemlwIGJvbWJzIGFuZCBvdGhlciBudWlzYW5jZVxuICAgICAgbGV0IHJlc3BvbnNlQnl0ZXNMZWZ0ID0gdGhpcy5fbWF4UmVzcG9uc2VTaXplIHx8IDIwMDAwMDAwMDtcbiAgICAgIHJlcy5vbignZGF0YScsIChidWYpID0+IHtcbiAgICAgICAgcmVzcG9uc2VCeXRlc0xlZnQgLT0gYnVmLmJ5dGVMZW5ndGggfHwgYnVmLmxlbmd0aCA+IDAgPyBidWYubGVuZ3RoIDogMDtcbiAgICAgICAgaWYgKHJlc3BvbnNlQnl0ZXNMZWZ0IDwgMCkge1xuICAgICAgICAgIC8vIFRoaXMgd2lsbCBwcm9wYWdhdGUgdGhyb3VnaCBlcnJvciBldmVudFxuICAgICAgICAgIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKCdNYXhpbXVtIHJlc3BvbnNlIHNpemUgcmVhY2hlZCcpO1xuICAgICAgICAgIGVycm9yLmNvZGUgPSAnRVRPT0xBUkdFJztcbiAgICAgICAgICAvLyBQYXJzZXJzIGFyZW4ndCByZXF1aXJlZCB0byBvYnNlcnZlIGVycm9yIGV2ZW50LFxuICAgICAgICAgIC8vIHNvIHdvdWxkIGluY29ycmVjdGx5IHJlcG9ydCBzdWNjZXNzXG4gICAgICAgICAgcGFyc2VySGFuZGxlc0VuZCA9IGZhbHNlO1xuICAgICAgICAgIC8vIFdpbGwgbm90IGVtaXQgZXJyb3IgZXZlbnRcbiAgICAgICAgICByZXMuZGVzdHJveShlcnJvcik7XG4gICAgICAgICAgLy8gc28gd2UgZG8gY2FsbGJhY2sgbm93XG4gICAgICAgICAgdGhpcy5jYWxsYmFjayhlcnJvciwgbnVsbCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChwYXJzZXIpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIFVuYnVmZmVyZWQgcGFyc2VycyBhcmUgc3VwcG9zZWQgdG8gZW1pdCByZXNwb25zZSBlYXJseSxcbiAgICAgICAgLy8gd2hpY2ggaXMgd2VpcmQgQlRXLCBiZWNhdXNlIHJlc3BvbnNlLmJvZHkgd29uJ3QgYmUgdGhlcmUuXG4gICAgICAgIHBhcnNlckhhbmRsZXNFbmQgPSBidWZmZXI7XG5cbiAgICAgICAgcGFyc2VyKHJlcywgKGVycm9yLCBvYmplY3QsIGZpbGVzKSA9PiB7XG4gICAgICAgICAgaWYgKHRoaXMudGltZWRvdXQpIHtcbiAgICAgICAgICAgIC8vIFRpbWVvdXQgaGFzIGFscmVhZHkgaGFuZGxlZCBhbGwgY2FsbGJhY2tzXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gSW50ZW50aW9uYWwgKG5vbi10aW1lb3V0KSBhYm9ydCBpcyBzdXBwb3NlZCB0byBwcmVzZXJ2ZSBwYXJ0aWFsIHJlc3BvbnNlLFxuICAgICAgICAgIC8vIGV2ZW4gaWYgaXQgZG9lc24ndCBwYXJzZS5cbiAgICAgICAgICBpZiAoZXJyb3IgJiYgIXRoaXMuX2Fib3J0ZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNhbGxiYWNrKGVycm9yKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAocGFyc2VySGFuZGxlc0VuZCkge1xuICAgICAgICAgICAgaWYgKG11bHRpcGFydCkge1xuICAgICAgICAgICAgICAvLyBmb3JtaWRhYmxlIHYzIGFsd2F5cyByZXR1cm5zIGFuIGFycmF5IHdpdGggdGhlIHZhbHVlIGluIGl0XG4gICAgICAgICAgICAgIC8vIHNvIHdlIG5lZWQgdG8gZmxhdHRlbiBpdFxuICAgICAgICAgICAgICBpZiAob2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gb2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IG9iamVjdFtrZXldO1xuICAgICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpICYmIHZhbHVlLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICBvYmplY3Rba2V5XSA9IHZhbHVlWzBdO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAoZmlsZXMpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBmaWxlcykge1xuICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBmaWxlc1trZXldO1xuICAgICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpICYmIHZhbHVlLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICBmaWxlc1trZXldID0gdmFsdWVbMF07XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmaWxlc1trZXldID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmVtaXQoJ2VuZCcpO1xuICAgICAgICAgICAgdGhpcy5jYWxsYmFjayhudWxsLCB0aGlzLl9lbWl0UmVzcG9uc2Uob2JqZWN0LCBmaWxlcykpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgdGhpcy5jYWxsYmFjayhlcnIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5yZXMgPSByZXM7XG5cbiAgICAvLyB1bmJ1ZmZlcmVkXG4gICAgaWYgKCFidWZmZXIpIHtcbiAgICAgIGRlYnVnKCd1bmJ1ZmZlcmVkICVzICVzJywgdGhpcy5tZXRob2QsIHRoaXMudXJsKTtcbiAgICAgIHRoaXMuY2FsbGJhY2sobnVsbCwgdGhpcy5fZW1pdFJlc3BvbnNlKCkpO1xuICAgICAgaWYgKG11bHRpcGFydCkgcmV0dXJuOyAvLyBhbGxvdyBtdWx0aXBhcnQgdG8gaGFuZGxlIGVuZCBldmVudFxuICAgICAgcmVzLm9uY2UoJ2VuZCcsICgpID0+IHtcbiAgICAgICAgZGVidWcoJ2VuZCAlcyAlcycsIHRoaXMubWV0aG9kLCB0aGlzLnVybCk7XG4gICAgICAgIHRoaXMuZW1pdCgnZW5kJyk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyB0ZXJtaW5hdGluZyBldmVudHNcbiAgICByZXMub25jZSgnZXJyb3InLCAoZXJyb3IpID0+IHtcbiAgICAgIHBhcnNlckhhbmRsZXNFbmQgPSBmYWxzZTtcbiAgICAgIHRoaXMuY2FsbGJhY2soZXJyb3IsIG51bGwpO1xuICAgIH0pO1xuICAgIGlmICghcGFyc2VySGFuZGxlc0VuZClcbiAgICAgIHJlcy5vbmNlKCdlbmQnLCAoKSA9PiB7XG4gICAgICAgIGRlYnVnKCdlbmQgJXMgJXMnLCB0aGlzLm1ldGhvZCwgdGhpcy51cmwpO1xuICAgICAgICAvLyBUT0RPOiB1bmxlc3MgYnVmZmVyaW5nIGVtaXQgZWFybGllciB0byBzdHJlYW1cbiAgICAgICAgdGhpcy5lbWl0KCdlbmQnKTtcbiAgICAgICAgdGhpcy5jYWxsYmFjayhudWxsLCB0aGlzLl9lbWl0UmVzcG9uc2UoKSk7XG4gICAgICB9KTtcbiAgfSk7XG5cbiAgdGhpcy5lbWl0KCdyZXF1ZXN0JywgdGhpcyk7XG5cbiAgY29uc3QgZ2V0UHJvZ3Jlc3NNb25pdG9yID0gKCkgPT4ge1xuICAgIGNvbnN0IGxlbmd0aENvbXB1dGFibGUgPSB0cnVlO1xuICAgIGNvbnN0IHRvdGFsID0gcmVxLmdldEhlYWRlcignQ29udGVudC1MZW5ndGgnKTtcbiAgICBsZXQgbG9hZGVkID0gMDtcblxuICAgIGNvbnN0IHByb2dyZXNzID0gbmV3IFN0cmVhbS5UcmFuc2Zvcm0oKTtcbiAgICBwcm9ncmVzcy5fdHJhbnNmb3JtID0gKGNodW5rLCBlbmNvZGluZywgY2FsbGJhY2spID0+IHtcbiAgICAgIGxvYWRlZCArPSBjaHVuay5sZW5ndGg7XG4gICAgICB0aGlzLmVtaXQoJ3Byb2dyZXNzJywge1xuICAgICAgICBkaXJlY3Rpb246ICd1cGxvYWQnLFxuICAgICAgICBsZW5ndGhDb21wdXRhYmxlLFxuICAgICAgICBsb2FkZWQsXG4gICAgICAgIHRvdGFsXG4gICAgICB9KTtcbiAgICAgIGNhbGxiYWNrKG51bGwsIGNodW5rKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHByb2dyZXNzO1xuICB9O1xuXG4gIGNvbnN0IGJ1ZmZlclRvQ2h1bmtzID0gKGJ1ZmZlcikgPT4ge1xuICAgIGNvbnN0IGNodW5rU2l6ZSA9IDE2ICogMTAyNDsgLy8gZGVmYXVsdCBoaWdoV2F0ZXJNYXJrIHZhbHVlXG4gICAgY29uc3QgY2h1bmtpbmcgPSBuZXcgU3RyZWFtLlJlYWRhYmxlKCk7XG4gICAgY29uc3QgdG90YWxMZW5ndGggPSBidWZmZXIubGVuZ3RoO1xuICAgIGNvbnN0IHJlbWFpbmRlciA9IHRvdGFsTGVuZ3RoICUgY2h1bmtTaXplO1xuICAgIGNvbnN0IGN1dG9mZiA9IHRvdGFsTGVuZ3RoIC0gcmVtYWluZGVyO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjdXRvZmY7IGkgKz0gY2h1bmtTaXplKSB7XG4gICAgICBjb25zdCBjaHVuayA9IGJ1ZmZlci5zbGljZShpLCBpICsgY2h1bmtTaXplKTtcbiAgICAgIGNodW5raW5nLnB1c2goY2h1bmspO1xuICAgIH1cblxuICAgIGlmIChyZW1haW5kZXIgPiAwKSB7XG4gICAgICBjb25zdCByZW1haW5kZXJCdWZmZXIgPSBidWZmZXIuc2xpY2UoLXJlbWFpbmRlcik7XG4gICAgICBjaHVua2luZy5wdXNoKHJlbWFpbmRlckJ1ZmZlcik7XG4gICAgfVxuXG4gICAgY2h1bmtpbmcucHVzaChudWxsKTsgLy8gbm8gbW9yZSBkYXRhXG5cbiAgICByZXR1cm4gY2h1bmtpbmc7XG4gIH07XG5cbiAgLy8gaWYgYSBGb3JtRGF0YSBpbnN0YW5jZSBnb3QgY3JlYXRlZCwgdGhlbiB3ZSBzZW5kIHRoYXQgYXMgdGhlIHJlcXVlc3QgYm9keVxuICBjb25zdCBmb3JtRGF0YSA9IHRoaXMuX2Zvcm1EYXRhO1xuICBpZiAoZm9ybURhdGEpIHtcbiAgICAvLyBzZXQgaGVhZGVyc1xuICAgIGNvbnN0IGhlYWRlcnMgPSBmb3JtRGF0YS5nZXRIZWFkZXJzKCk7XG4gICAgZm9yIChjb25zdCBpIGluIGhlYWRlcnMpIHtcbiAgICAgIGlmIChoYXNPd24oaGVhZGVycywgaSkpIHtcbiAgICAgICAgZGVidWcoJ3NldHRpbmcgRm9ybURhdGEgaGVhZGVyOiBcIiVzOiAlc1wiJywgaSwgaGVhZGVyc1tpXSk7XG4gICAgICAgIHJlcS5zZXRIZWFkZXIoaSwgaGVhZGVyc1tpXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gYXR0ZW1wdCB0byBnZXQgXCJDb250ZW50LUxlbmd0aFwiIGhlYWRlclxuICAgIGZvcm1EYXRhLmdldExlbmd0aCgoZXJyb3IsIGxlbmd0aCkgPT4ge1xuICAgICAgLy8gVE9ETzogQWRkIGNodW5rZWQgZW5jb2Rpbmcgd2hlbiBubyBsZW5ndGggKGlmIGVycilcbiAgICAgIGlmIChlcnJvcikgZGVidWcoJ2Zvcm1EYXRhLmdldExlbmd0aCBoYWQgZXJyb3InLCBlcnJvciwgbGVuZ3RoKTtcblxuICAgICAgZGVidWcoJ2dvdCBGb3JtRGF0YSBDb250ZW50LUxlbmd0aDogJXMnLCBsZW5ndGgpO1xuICAgICAgaWYgKHR5cGVvZiBsZW5ndGggPT09ICdudW1iZXInKSB7XG4gICAgICAgIHJlcS5zZXRIZWFkZXIoJ0NvbnRlbnQtTGVuZ3RoJywgbGVuZ3RoKTtcbiAgICAgIH1cblxuICAgICAgZm9ybURhdGEucGlwZShnZXRQcm9ncmVzc01vbml0b3IoKSkucGlwZShyZXEpO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKEJ1ZmZlci5pc0J1ZmZlcihkYXRhKSkge1xuICAgIGJ1ZmZlclRvQ2h1bmtzKGRhdGEpLnBpcGUoZ2V0UHJvZ3Jlc3NNb25pdG9yKCkpLnBpcGUocmVxKTtcbiAgfSBlbHNlIHtcbiAgICByZXEuZW5kKGRhdGEpO1xuICB9XG59O1xuXG4vLyBDaGVjayB3aGV0aGVyIHJlc3BvbnNlIGhhcyBhIG5vbi0wLXNpemVkIGd6aXAtZW5jb2RlZCBib2R5XG5SZXF1ZXN0LnByb3RvdHlwZS5fc2hvdWxkRGVjb21wcmVzcyA9IChyZXMpID0+IHtcbiAgcmV0dXJuIGhhc05vbkVtcHR5UmVzcG9uc2VDb250ZW50KHJlcykgJiYgKGlzR3ppcE9yRGVmbGF0ZUVuY29kaW5nKHJlcykgfHwgaXNCcm90bGlFbmNvZGluZyhyZXMpKTtcbn07XG5cblxuLyoqXG4gKiBPdmVycmlkZXMgRE5TIGZvciBzZWxlY3RlZCBob3N0bmFtZXMuIFRha2VzIG9iamVjdCBtYXBwaW5nIGhvc3RuYW1lcyB0byBJUCBhZGRyZXNzZXMuXG4gKlxuICogV2hlbiBtYWtpbmcgYSByZXF1ZXN0IHRvIGEgVVJMIHdpdGggYSBob3N0bmFtZSBleGFjdGx5IG1hdGNoaW5nIGEga2V5IGluIHRoZSBvYmplY3QsXG4gKiB1c2UgdGhlIGdpdmVuIElQIGFkZHJlc3MgdG8gY29ubmVjdCwgaW5zdGVhZCBvZiB1c2luZyBETlMgdG8gcmVzb2x2ZSB0aGUgaG9zdG5hbWUuXG4gKlxuICogQSBzcGVjaWFsIGhvc3QgYCpgIG1hdGNoZXMgZXZlcnkgaG9zdG5hbWUgKGtlZXAgcmVkaXJlY3RzIGluIG1pbmQhKVxuICpcbiAqICAgICAgcmVxdWVzdC5jb25uZWN0KHtcbiAqICAgICAgICAndGVzdC5leGFtcGxlLmNvbSc6ICcxMjcuMC4wLjEnLFxuICogICAgICAgICdpcHY2LmV4YW1wbGUuY29tJzogJzo6MScsXG4gKiAgICAgIH0pXG4gKi9cblJlcXVlc3QucHJvdG90eXBlLmNvbm5lY3QgPSBmdW5jdGlvbiAoY29ubmVjdE92ZXJyaWRlKSB7XG4gIGlmICh0eXBlb2YgY29ubmVjdE92ZXJyaWRlID09PSAnc3RyaW5nJykge1xuICAgIHRoaXMuX2Nvbm5lY3RPdmVycmlkZSA9IHsgJyonOiBjb25uZWN0T3ZlcnJpZGUgfTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgY29ubmVjdE92ZXJyaWRlID09PSAnb2JqZWN0Jykge1xuICAgIHRoaXMuX2Nvbm5lY3RPdmVycmlkZSA9IGNvbm5lY3RPdmVycmlkZTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLl9jb25uZWN0T3ZlcnJpZGUgPSB1bmRlZmluZWQ7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cblJlcXVlc3QucHJvdG90eXBlLnRydXN0TG9jYWxob3N0ID0gZnVuY3Rpb24gKHRvZ2dsZSkge1xuICB0aGlzLl90cnVzdExvY2FsaG9zdCA9IHRvZ2dsZSA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IHRvZ2dsZTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBnZW5lcmF0ZSBIVFRQIHZlcmIgbWV0aG9kc1xuaWYgKCFtZXRob2RzLmluY2x1ZGVzKCdkZWwnKSkge1xuICAvLyBjcmVhdGUgYSBjb3B5IHNvIHdlIGRvbid0IGNhdXNlIGNvbmZsaWN0cyB3aXRoXG4gIC8vIG90aGVyIHBhY2thZ2VzIHVzaW5nIHRoZSBtZXRob2RzIHBhY2thZ2UgYW5kXG4gIC8vIG5wbSAzLnhcbiAgbWV0aG9kcyA9IFsuLi5tZXRob2RzXTtcbiAgbWV0aG9kcy5wdXNoKCdkZWwnKTtcbn1cblxuZm9yIChsZXQgbWV0aG9kIG9mIG1ldGhvZHMpIHtcbiAgY29uc3QgbmFtZSA9IG1ldGhvZDtcbiAgbWV0aG9kID0gbWV0aG9kID09PSAnZGVsJyA/ICdkZWxldGUnIDogbWV0aG9kO1xuXG4gIG1ldGhvZCA9IG1ldGhvZC50b1VwcGVyQ2FzZSgpO1xuICByZXF1ZXN0W25hbWVdID0gKHVybCwgZGF0YSwgZm4pID0+IHtcbiAgICBjb25zdCByZXF1ZXN0XyA9IHJlcXVlc3QobWV0aG9kLCB1cmwpO1xuICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgZm4gPSBkYXRhO1xuICAgICAgZGF0YSA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKGRhdGEpIHtcbiAgICAgIGlmIChtZXRob2QgPT09ICdHRVQnIHx8IG1ldGhvZCA9PT0gJ0hFQUQnKSB7XG4gICAgICAgIHJlcXVlc3RfLnF1ZXJ5KGRhdGEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVxdWVzdF8uc2VuZChkYXRhKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZm4pIHJlcXVlc3RfLmVuZChmbik7XG4gICAgcmV0dXJuIHJlcXVlc3RfO1xuICB9O1xufVxuXG4vKipcbiAqIENoZWNrIGlmIGBtaW1lYCBpcyB0ZXh0IGFuZCBzaG91bGQgYmUgYnVmZmVyZWQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1pbWVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGlzVGV4dChtaW1lKSB7XG4gIGNvbnN0IHBhcnRzID0gbWltZS5zcGxpdCgnLycpO1xuICBsZXQgdHlwZSA9IHBhcnRzWzBdO1xuICBpZiAodHlwZSkgdHlwZSA9IHR5cGUudG9Mb3dlckNhc2UoKS50cmltKCk7XG4gIGxldCBzdWJ0eXBlID0gcGFydHNbMV07XG4gIGlmIChzdWJ0eXBlKSBzdWJ0eXBlID0gc3VidHlwZS50b0xvd2VyQ2FzZSgpLnRyaW0oKTtcblxuICByZXR1cm4gdHlwZSA9PT0gJ3RleHQnIHx8IHN1YnR5cGUgPT09ICd4LXd3dy1mb3JtLXVybGVuY29kZWQnO1xufVxuXG4vLyBUaGlzIGlzIG5vdCBhIGNhdGNoYWxsLCBidXQgYSBzdGFydC4gSXQgbWlnaHQgYmUgdXNlZnVsXG4vLyBpbiB0aGUgbG9uZyBydW4gdG8gaGF2ZSBmaWxlIHRoYXQgaW5jbHVkZXMgYWxsIGJpbmFyeVxuLy8gY29udGVudCB0eXBlcyBmcm9tIGh0dHBzOi8vd3d3LmlhbmEub3JnL2Fzc2lnbm1lbnRzL21lZGlhLXR5cGVzL21lZGlhLXR5cGVzLnhodG1sXG5mdW5jdGlvbiBpc0JpbmFyeShtaW1lKSB7XG4gIGxldCBbcmVnaXN0cnksIG5hbWVdID0gbWltZS5zcGxpdCgnLycpO1xuICBpZiAocmVnaXN0cnkpIHJlZ2lzdHJ5ID0gcmVnaXN0cnkudG9Mb3dlckNhc2UoKS50cmltKCk7XG4gIGlmIChuYW1lKSBuYW1lID0gbmFtZS50b0xvd2VyQ2FzZSgpLnRyaW0oKTtcbiAgcmV0dXJuIChcbiAgICBbJ2F1ZGlvJywgJ2ZvbnQnLCAnaW1hZ2UnLCAndmlkZW8nXS5pbmNsdWRlcyhyZWdpc3RyeSkgfHxcbiAgICBbJ2d6JywgJ2d6aXAnXS5pbmNsdWRlcyhuYW1lKVxuICApO1xufVxuXG4vKipcbiAqIENoZWNrIGlmIGBtaW1lYCBpcyBqc29uIG9yIGhhcyAranNvbiBzdHJ1Y3R1cmVkIHN5bnRheCBzdWZmaXguXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1pbWVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBpc0pTT04obWltZSkge1xuICAvLyBzaG91bGQgbWF0Y2ggL2pzb24gb3IgK2pzb25cbiAgLy8gYnV0IG5vdCAvanNvbi1zZXFcbiAgcmV0dXJuIC9bLytdanNvbigkfFteLVxcd10pL2kudGVzdChtaW1lKTtcbn1cblxuLyoqXG4gKiBDaGVjayBpZiB3ZSBzaG91bGQgZm9sbG93IHRoZSByZWRpcmVjdCBgY29kZWAuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGNvZGVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBpc1JlZGlyZWN0KGNvZGUpIHtcbiAgcmV0dXJuIFszMDEsIDMwMiwgMzAzLCAzMDUsIDMwNywgMzA4XS5pbmNsdWRlcyhjb2RlKTtcbn1cblxuZnVuY3Rpb24gaGFzTm9uRW1wdHlSZXNwb25zZUNvbnRlbnQocmVzKSB7XG4gIGlmIChyZXMuc3RhdHVzQ29kZSA9PT0gMjA0IHx8IHJlcy5zdGF0dXNDb2RlID09PSAzMDQpIHtcbiAgICAvLyBUaGVzZSBhcmVuJ3Qgc3VwcG9zZWQgdG8gaGF2ZSBhbnkgYm9keVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIGhlYWRlciBjb250ZW50IGlzIGEgc3RyaW5nLCBhbmQgZGlzdGluY3Rpb24gYmV0d2VlbiAwIGFuZCBubyBpbmZvcm1hdGlvbiBpcyBjcnVjaWFsXG4gIGlmIChyZXMuaGVhZGVyc1snY29udGVudC1sZW5ndGgnXSA9PT0gJzAnKSB7XG4gICAgLy8gV2Uga25vdyB0aGF0IHRoZSBib2R5IGlzIGVtcHR5ICh1bmZvcnR1bmF0ZWx5LCB0aGlzIGNoZWNrIGRvZXMgbm90IGNvdmVyIGNodW5rZWQgZW5jb2RpbmcpXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG4iXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTtBQUNBOztBQUVBLE1BQU07RUFBRUE7QUFBTyxDQUFDLEdBQUdDLE9BQU8sQ0FBQyxLQUFLLENBQUM7QUFDakMsTUFBTUMsTUFBTSxHQUFHRCxPQUFPLENBQUMsUUFBUSxDQUFDO0FBQ2hDLE1BQU1FLEtBQUssR0FBR0YsT0FBTyxDQUFDLE9BQU8sQ0FBQztBQUM5QixNQUFNRyxJQUFJLEdBQUdILE9BQU8sQ0FBQyxNQUFNLENBQUM7QUFDNUIsTUFBTUksRUFBRSxHQUFHSixPQUFPLENBQUMsSUFBSSxDQUFDO0FBQ3hCLE1BQU1LLElBQUksR0FBR0wsT0FBTyxDQUFDLE1BQU0sQ0FBQztBQUM1QixNQUFNTSxJQUFJLEdBQUdOLE9BQU8sQ0FBQyxNQUFNLENBQUM7QUFDNUIsTUFBTU8sRUFBRSxHQUFHUCxPQUFPLENBQUMsSUFBSSxDQUFDO0FBQ3hCLE1BQU1RLElBQUksR0FBR1IsT0FBTyxDQUFDLE1BQU0sQ0FBQztBQUM1QixJQUFJUyxPQUFPLEdBQUdULE9BQU8sQ0FBQyxTQUFTLENBQUM7QUFDaEMsTUFBTVUsUUFBUSxHQUFHVixPQUFPLENBQUMsV0FBVyxDQUFDO0FBQ3JDLE1BQU1XLFVBQVUsR0FBR1gsT0FBTyxDQUFDLFlBQVksQ0FBQztB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