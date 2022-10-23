"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

/**
 * Root reference for iframes.
 */
let root;

if (typeof window !== 'undefined') {
  // Browser window
  root = window;
} else if (typeof self === 'undefined') {
  // Other environments
  console.warn('Using browser-only version of superagent in non-browser environment');
  root = void 0;
} else {
  // Web Worker
  root = self;
}

const Emitter = require('component-emitter');

const safeStringify = require('fast-safe-stringify');

const qs = require('qs');

const RequestBase = require('./request-base');

const _require = require('./utils'),
      isObject = _require.isObject,
      mixin = _require.mixin,
      hasOwn = _require.hasOwn;

const ResponseBase = require('./response-base');

const Agent = require('./agent-base');
/**
 * Noop.
 */


function noop() {}
/**
 * Expose `request`.
 */


module.exports = function (method, url) {
  // callback
  if (typeof url === 'function') {
    return new exports.Request('GET', method).end(url);
  } // url first


  if (arguments.length === 1) {
    return new exports.Request('GET', method);
  }

  return new exports.Request(method, url);
};

exports = module.exports;
const request = exports;
exports.Request = Request;
/**
 * Determine XHR.
 */

request.getXHR = () => {
  if (root.XMLHttpRequest) {
    return new root.XMLHttpRequest();
  }

  throw new Error('Browser-only version of superagent could not find XHR');
};
/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */


const trim = ''.trim ? s => s.trim() : s => s.replace(/(^\s*|\s*$)/g, '');
/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(object) {
  if (!isObject(object)) return object;
  const pairs = [];

  for (const key in object) {
    if (hasOwn(object, key)) pushEncodedKeyValuePair(pairs, key, object[key]);
  }

  return pairs.join('&');
}
/**
 * Helps 'serialize' with serializing arrays.
 * Mutates the pairs array.
 *
 * @param {Array} pairs
 * @param {String} key
 * @param {Mixed} val
 */


function pushEncodedKeyValuePair(pairs, key, value) {
  if (value === undefined) return;

  if (value === null) {
    pairs.push(encodeURI(key));
    return;
  }

  if (Array.isArray(value)) {
    var _iterator = _createForOfIteratorHelper(value),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        const v = _step.value;
        pushEncodedKeyValuePair(pairs, key, v);
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  } else if (isObject(value)) {
    for (const subkey in value) {
      if (hasOwn(value, subkey)) pushEncodedKeyValuePair(pairs, `${key}[${subkey}]`, value[subkey]);
    }
  } else {
    pairs.push(encodeURI(key) + '=' + encodeURIComponent(value));
  }
}
/**
 * Expose serialization method.
 */


request.serializeObject = serialize;
/**
 * Parse the given x-www-form-urlencoded `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseString(string_) {
  const object = {};
  const pairs = string_.split('&');
  let pair;
  let pos;

  for (let i = 0, length_ = pairs.length; i < length_; ++i) {
    pair = pairs[i];
    pos = pair.indexOf('=');

    if (pos === -1) {
      object[decodeURIComponent(pair)] = '';
    } else {
      object[decodeURIComponent(pair.slice(0, pos))] = decodeURIComponent(pair.slice(pos + 1));
    }
  }

  return object;
}
/**
 * Expose parser.
 */


request.parseString = parseString;
/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'text/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  form: 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};
/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

request.serialize = {
  'application/x-www-form-urlencoded': qs.stringify,
  'application/json': safeStringify
};
/**
 * Default parsers.
 *
 *     superagent.parse['application/xml'] = function(str){
 *       return { object parsed from str };
 *     };
 *
 */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};
/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(string_) {
  const lines = string_.split(/\r?\n/);
  const fields = {};
  let index;
  let line;
  let field;
  let value;

  for (let i = 0, length_ = lines.length; i < length_; ++i) {
    line = lines[i];
    index = line.indexOf(':');

    if (index === -1) {
      // could be empty line, just skip it
      continue;
    }

    field = line.slice(0, index).toLowerCase();
    value = trim(line.slice(index + 1));
    fields[field] = value;
  }

  return fields;
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
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */


function Response(request_) {
  this.req = request_;
  this.xhr = this.req.xhr; // responseText is accessible only if responseType is '' or 'text' and on older browsers

  this.text = this.req.method !== 'HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text') || typeof this.xhr.responseType === 'undefined' ? this.xhr.responseText : null;
  this.statusText = this.req.xhr.statusText;
  let status = this.xhr.status; // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request

  if (status === 1223) {
    status = 204;
  }

  this._setStatusProperties(status);

  this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  this.header = this.headers; // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.

  this.header['content-type'] = this.xhr.getResponseHeader('content-type');

  this._setHeaderProperties(this.header);

  if (this.text === null && request_._responseType) {
    this.body = this.xhr.response;
  } else {
    this.body = this.req.method === 'HEAD' ? null : this._parseBody(this.text ? this.text : this.xhr.response);
  }
}

mixin(Response.prototype, ResponseBase.prototype);
/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype._parseBody = function (string_) {
  let parse = request.parse[this.type];

  if (this.req._parser) {
    return this.req._parser(this, string_);
  }

  if (!parse && isJSON(this.type)) {
    parse = request.parse['application/json'];
  }

  return parse && string_ && (string_.length > 0 || string_ instanceof Object) ? parse(string_) : null;
};
/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */


Response.prototype.toError = function () {
  const req = this.req;
  const method = req.method;
  const url = req.url;
  const message = `cannot ${method} ${url} (${this.status})`;
  const error = new Error(message);
  error.status = this.status;
  error.method = method;
  error.url = url;
  return error;
};
/**
 * Expose `Response`.
 */


request.Response = Response;
/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  const self = this;
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {}; // preserves header name case

  this._header = {}; // coerces header names to lowercase

  this.on('end', () => {
    let error = null;
    let res = null;

    try {
      res = new Response(self);
    } catch (err) {
      error = new Error('Parser is unable to parse the response');
      error.parse = true;
      error.original = err; // issue #675: return the raw response if the response parsing fails

      if (self.xhr) {
        // ie9 doesn't have 'response' property
        error.rawResponse = typeof self.xhr.responseType === 'undefined' ? self.xhr.responseText : self.xhr.response; // issue #876: return the http status code if the response parsing fails

        error.status = self.xhr.status ? self.xhr.status : null;
        error.statusCode = error.status; // backwards-compat only
      } else {
        error.rawResponse = null;
        error.status = null;
      }

      return self.callback(error);
    }

    self.emit('response', res);
    let new_error;

    try {
      if (!self._isResponseOK(res)) {
        new_error = new Error(res.statusText || res.text || 'Unsuccessful HTTP response');
      }
    } catch (err) {
      new_error = err; // ok() callback can throw
    } // #1000 don't catch errors from the callback to avoid double calling it


    if (new_error) {
      new_error.original = error;
      new_error.response = res;
      new_error.status = new_error.status || res.status;
      self.callback(new_error, res);
    } else {
      self.callback(null, res);
    }
  });
}
/**
 * Mixin `Emitter` and `RequestBase`.
 */
// eslint-disable-next-line new-cap


Emitter(Request.prototype);
mixin(Request.prototype, RequestBase.prototype);
/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function (type) {
  this.set('Content-Type', request.types[type] || type);
  return this;
};
/**
 * Set Accept to `type`, mapping values from `request.types`.
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
  this.set('Accept', request.types[type] || type);
  return this;
};
/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} [pass] optional in case of using 'bearer' as type
 * @param {Object} options with 'type' property 'auto', 'basic' or 'bearer' (default 'basic')
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
      type: typeof btoa === 'function' ? 'basic' : 'auto'
    };
  }

  const encoder = options.encoder ? options.encoder : string => {
    if (typeof btoa === 'function') {
      return btoa(string);
    }

    throw new Error('Cannot use basic auth, btoa is not a function');
  };
  return this._auth(user, pass, options, encoder);
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
  if (typeof value !== 'string') value = serialize(value);
  if (value) this._query.push(value);
  return this;
};
/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `options` (or filename).
 *
 * ``` js
 * request.post('/upload')
 *   .attach('content', new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String|Object} options
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.attach = function (field, file, options) {
  if (file) {
    if (this._data) {
      throw new Error("superagent can't mix .send() and .attach()");
    }

    this._getFormData().append(field, file, options || file.name);
  }

  return this;
};

Request.prototype._getFormData = function () {
  if (!this._formData) {
    this._formData = new root.FormData();
  }

  return this._formData;
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

  const fn = this._callback;
  this.clearTimeout();

  if (error) {
    if (this._maxRetries) error.retries = this._retries - 1;
    this.emit('error', error);
  }

  fn(error, res);
};
/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */


Request.prototype.crossDomainError = function () {
  const error = new Error('Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.');
  error.crossDomain = true;
  error.status = this.status;
  error.method = this.method;
  error.url = this.url;
  this.callback(error);
}; // This only warns, because the request is still likely to work


Request.prototype.agent = function () {
  console.warn('This is not supported in browser version of superagent');
  return this;
};

Request.prototype.ca = Request.prototype.agent;
Request.prototype.buffer = Request.prototype.ca; // This throws, because it can't send/receive data as expected

Request.prototype.write = () => {
  throw new Error('Streaming is not supported in browser version of superagent');
};

Request.prototype.pipe = Request.prototype.write;
/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * @param {Object} obj host object
 * @return {Boolean} is a host object
 * @api private
 */

Request.prototype._isHost = function (object) {
  // Native objects stringify to [object File], [object Blob], [object FormData], etc.
  return object && typeof object === 'object' && !Array.isArray(object) && Object.prototype.toString.call(object) !== '[object Object]';
};
/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.end = function (fn) {
  if (this._endCalled) {
    console.warn('Warning: .end() was called twice. This is not supported in superagent');
  }

  this._endCalled = true; // store callback

  this._callback = fn || noop; // querystring

  this._finalizeQueryString();

  this._end();
};

Request.prototype._setUploadTimeout = function () {
  const self = this; // upload timeout it's wokrs only if deadline timeout is off

  if (this._uploadTimeout && !this._uploadTimeoutTimer) {
    this._uploadTimeoutTimer = setTimeout(() => {
      self._timeoutError('Upload timeout of ', self._uploadTimeout, 'ETIMEDOUT');
    }, this._uploadTimeout);
  }
}; // eslint-disable-next-line complexity


Request.prototype._end = function () {
  if (this._aborted) return this.callback(new Error('The request has been aborted even before .end() was called'));
  const self = this;
  this.xhr = request.getXHR();
  const xhr = this.xhr;
  let data = this._formData || this._data;

  this._setTimeouts(); // state change


  xhr.addEventListener('readystatechange', () => {
    const readyState = xhr.readyState;

    if (readyState >= 2 && self._responseTimeoutTimer) {
      clearTimeout(self._responseTimeoutTimer);
    }

    if (readyState !== 4) {
      return;
    } // In IE9, reads to any property (e.g. status) off of an aborted XHR will
    // result in the error "Could not complete the operation due to error c00c023f"


    let status;

    try {
      status = xhr.status;
    } catch (err) {
      status = 0;
    }

    if (!status) {
      if (self.timedout || self._aborted) return;
      return self.crossDomainError();
    }

    self.emit('end');
  }); // progress

  const handleProgress = (direction, e) => {
    if (e.total > 0) {
      e.percent = e.loaded / e.total * 100;

      if (e.percent === 100) {
        clearTimeout(self._uploadTimeoutTimer);
      }
    }

    e.direction = direction;
    self.emit('progress', e);
  };

  if (this.hasListeners('progress')) {
    try {
      xhr.addEventListener('progress', handleProgress.bind(null, 'download'));

      if (xhr.upload) {
        xhr.upload.addEventListener('progress', handleProgress.bind(null, 'upload'));
      }
    } catch (err) {// Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
      // Reported here:
      // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
    }
  }

  if (xhr.upload) {
    this._setUploadTimeout();
  } // initiate request


  try {
    if (this.username && this.password) {
      xhr.open(this.method, this.url, true, this.username, this.password);
    } else {
      xhr.open(this.method, this.url, true);
    }
  } catch (err) {
    // see #1149
    return this.callback(err);
  } // CORS


  if (this._withCredentials) xhr.withCredentials = true; // body

  if (!this._formData && this.method !== 'GET' && this.method !== 'HEAD' && typeof data !== 'string' && !this._isHost(data)) {
    // serialize stuff
    const contentType = this._header['content-type'];
    let serialize = this._serializer || request.serialize[contentType ? contentType.split(';')[0] : ''];

    if (!serialize && isJSON(contentType)) {
      serialize = request.serialize['application/json'];
    }

    if (serialize) data = serialize(data);
  } // set header fields


  for (const field in this.header) {
    if (this.header[field] === null) continue;
    if (hasOwn(this.header, field)) xhr.setRequestHeader(field, this.header[field]);
  }

  if (this._responseType) {
    xhr.responseType = this._responseType;
  } // send stuff


  this.emit('request', this); // IE11 xhr.send(undefined) sends 'undefined' string as POST payload (instead of nothing)
  // We need null here if data is undefined

  xhr.send(typeof data === 'undefined' ? null : data);
};

request.agent = () => new Agent();

for (var _i = 0, _arr = ['GET', 'POST', 'OPTIONS', 'PATCH', 'PUT', 'DELETE']; _i < _arr.length; _i++) {
  const method = _arr[_i];

  Agent.prototype[method.toLowerCase()] = function (url, fn) {
    const request_ = new request.Request(method, url);

    this._setDefaults(request_);

    if (fn) {
      request_.end(fn);
    }

    return request_;
  };
}

Agent.prototype.del = Agent.prototype.delete;
/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.get = (url, data, fn) => {
  const request_ = request('GET', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) request_.query(data);
  if (fn) request_.end(fn);
  return request_;
};
/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */


request.head = (url, data, fn) => {
  const request_ = request('HEAD', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) request_.query(data);
  if (fn) request_.end(fn);
  return request_;
};
/**
 * OPTIONS query to `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */


request.options = (url, data, fn) => {
  const request_ = request('OPTIONS', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) request_.send(data);
  if (fn) request_.end(fn);
  return request_;
};
/**
 * DELETE `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */


function del(url, data, fn) {
  const request_ = request('DELETE', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) request_.send(data);
  if (fn) request_.end(fn);
  return request_;
}

request.del = del;
request.delete = del;
/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.patch = (url, data, fn) => {
  const request_ = request('PATCH', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) request_.send(data);
  if (fn) request_.end(fn);
  return request_;
};
/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */


request.post = (url, data, fn) => {
  const request_ = request('POST', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) request_.send(data);
  if (fn) request_.end(fn);
  return request_;
};
/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */


request.put = (url, data, fn) => {
  const request_ = request('PUT', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) request_.send(data);
  if (fn) request_.end(fn);
  return request_;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJyb290Iiwid2luZG93Iiwic2VsZiIsImNvbnNvbGUiLCJ3YXJuIiwiRW1pdHRlciIsInJlcXVpcmUiLCJzYWZlU3RyaW5naWZ5IiwicXMiLCJSZXF1ZXN0QmFzZSIsImlzT2JqZWN0IiwibWl4aW4iLCJoYXNPd24iLCJSZXNwb25zZUJhc2UiLCJBZ2VudCIsIm5vb3AiLCJtb2R1bGUiLCJleHBvcnRzIiwibWV0aG9kIiwidXJsIiwiUmVxdWVzdCIsImVuZCIsImFyZ3VtZW50cyIsImxlbmd0aCIsInJlcXVlc3QiLCJnZXRYSFIiLCJYTUxIdHRwUmVxdWVzdCIsIkVycm9yIiwidHJpbSIsInMiLCJyZXBsYWNlIiwic2VyaWFsaXplIiwib2JqZWN0IiwicGFpcnMiLCJrZXkiLCJwdXNoRW5jb2RlZEtleVZhbHVlUGFpciIsImpvaW4iLCJ2YWx1ZSIsInVuZGVmaW5lZCIsInB1c2giLCJlbmNvZGVVUkkiLCJBcnJheSIsImlzQXJyYXkiLCJ2Iiwic3Via2V5IiwiZW5jb2RlVVJJQ29tcG9uZW50Iiwic2VyaWFsaXplT2JqZWN0IiwicGFyc2VTdHJpbmciLCJzdHJpbmdfIiwic3BsaXQiLCJwYWlyIiwicG9zIiwiaSIsImxlbmd0aF8iLCJpbmRleE9mIiwiZGVjb2RlVVJJQ29tcG9uZW50Iiwic2xpY2UiLCJ0eXBlcyIsImh0bWwiLCJqc29uIiwieG1sIiwidXJsZW5jb2RlZCIsImZvcm0iLCJzdHJpbmdpZnkiLCJwYXJzZSIsIkpTT04iLCJwYXJzZUhlYWRlciIsImxpbmVzIiwiZmllbGRzIiwiaW5kZXgiLCJsaW5lIiwiZmllbGQiLCJ0b0xvd2VyQ2FzZSIsImlzSlNPTiIsIm1pbWUiLCJ0ZXN0IiwiUmVzcG9uc2UiLCJyZXF1ZXN0XyIsInJlcSIsInhociIsInRleHQiLCJyZXNwb25zZVR5cGUiLCJyZXNwb25zZVRleHQiLCJzdGF0dXNUZXh0Iiwic3RhdHVzIiwiX3NldFN0YXR1c1Byb3BlcnRpZXMiLCJoZWFkZXJzIiwiZ2V0QWxsUmVzcG9uc2VIZWFkZXJzIiwiaGVhZGVyIiwiZ2V0UmVzcG9uc2VIZWFkZXIiLCJfc2V0SGVhZGVyUHJvcGVydGllcyIsIl9yZXNwb25zZVR5cGUiLCJib2R5IiwicmVzcG9uc2UiLCJfcGFyc2VCb2R5IiwicHJvdG90eXBlIiwidHlwZSIsIl9wYXJzZXIiLCJPYmplY3QiLCJ0b0Vycm9yIiwibWVzc2FnZSIsImVycm9yIiwiX3F1ZXJ5IiwiX2hlYWRlciIsIm9uIiwicmVzIiwiZXJyIiwib3JpZ2luYWwiLCJyYXdSZXNwb25zZSIsInN0YXR1c0NvZGUiLCJjYWxsYmFjayIsImVtaXQiLCJuZXdfZXJyb3IiLCJfaXNSZXNwb25zZU9LIiwic2V0IiwiYWNjZXB0IiwiYXV0aCIsInVzZXIiLCJwYXNzIiwib3B0aW9ucyIsImJ0b2EiLCJlbmNvZGVyIiwic3RyaW5nIiwiX2F1dGgiLCJxdWVyeSIsImF0dGFjaCIsImZpbGUiLCJfZGF0YSIsIl9nZXRGb3JtRGF0YSIsImFwcGVuZCIsIm5hbWUiLCJfZm9ybURhdGEiLCJGb3JtRGF0YSIsIl9zaG91bGRSZXRyeSIsIl9yZXRyeSIsImZuIiwiX2NhbGxiYWNrIiwiY2xlYXJUaW1lb3V0IiwiX21heFJldHJpZXMiLCJyZXRyaWVzIiwiX3JldHJpZXMiLCJjcm9zc0RvbWFpbkVycm9yIiwiY3Jvc3NEb21haW4iLCJhZ2VudCIsImNhIiwiYnVmZmVyIiwid3JpdGUiLCJwaXBlIiwiX2lzSG9zdCIsInRvU3RyaW5nIiwiY2FsbCIsIl9lbmRDYWxsZWQiLCJfZmluYWxpemVRdWVyeVN0cmluZyIsIl9lbmQiLCJfc2V0VXBsb2FkVGltZW91dCIsIl91cGxvYWRUaW1lb3V0IiwiX3VwbG9hZFRpbWVvdXRUaW1lciIsInNldFRpbWVvdXQiLCJfdGltZW91dEVycm9yIiwiX2Fib3J0ZWQiLCJkYXRhIiwiX3NldFRpbWVvdXRzIiwiYWRkRXZlbnRMaXN0ZW5lciIsInJlYWR5U3RhdGUiLCJfcmVzcG9uc2VUaW1lb3V0VGltZXIiLCJ0aW1lZG91dCIsImhhbmRsZVByb2dyZXNzIiwiZGlyZWN0aW9uIiwiZSIsInRvdGFsIiwicGVyY2VudCIsImxvYWRlZCIsImhhc0xpc3RlbmVycyIsImJpbmQiLCJ1cGxvYWQiLCJ1c2VybmFtZSIsInBhc3N3b3JkIiwib3BlbiIsIl93aXRoQ3JlZGVudGlhbHMiLCJ3aXRoQ3JlZGVudGlhbHMiLCJjb250ZW50VHlwZSIsIl9zZXJpYWxpemVyIiwic2V0UmVxdWVzdEhlYWRlciIsInNlbmQiLCJfc2V0RGVmYXVsdHMiLCJkZWwiLCJkZWxldGUiLCJnZXQiLCJoZWFkIiwicGF0Y2giLCJwb3N0IiwicHV0Il0sInNvdXJjZXMiOlsiLi4vc3JjL2NsaWVudC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFJvb3QgcmVmZXJlbmNlIGZvciBpZnJhbWVzLlxuICovXG5cbmxldCByb290O1xuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gIC8vIEJyb3dzZXIgd2luZG93XG4gIHJvb3QgPSB3aW5kb3c7XG59IGVsc2UgaWYgKHR5cGVvZiBzZWxmID09PSAndW5kZWZpbmVkJykge1xuICAvLyBPdGhlciBlbnZpcm9ubWVudHNcbiAgY29uc29sZS53YXJuKFxuICAgICdVc2luZyBicm93c2VyLW9ubHkgdmVyc2lvbiBvZiBzdXBlcmFnZW50IGluIG5vbi1icm93c2VyIGVudmlyb25tZW50J1xuICApO1xuICByb290ID0gdGhpcztcbn0gZWxzZSB7XG4gIC8vIFdlYiBXb3JrZXJcbiAgcm9vdCA9IHNlbGY7XG59XG5cbmNvbnN0IEVtaXR0ZXIgPSByZXF1aXJlKCdjb21wb25lbnQtZW1pdHRlcicpO1xuY29uc3Qgc2FmZVN0cmluZ2lmeSA9IHJlcXVpcmUoJ2Zhc3Qtc2FmZS1zdHJpbmdpZnknKTtcbmNvbnN0IHFzID0gcmVxdWlyZSgncXMnKTtcbmNvbnN0IFJlcXVlc3RCYXNlID0gcmVxdWlyZSgnLi9yZXF1ZXN0LWJhc2UnKTtcbmNvbnN0IHsgaXNPYmplY3QsIG1peGluLCBoYXNPd24gfSA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbmNvbnN0IFJlc3BvbnNlQmFzZSA9IHJlcXVpcmUoJy4vcmVzcG9uc2UtYmFzZScpO1xuY29uc3QgQWdlbnQgPSByZXF1aXJlKCcuL2FnZW50LWJhc2UnKTtcblxuLyoqXG4gKiBOb29wLlxuICovXG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG4vKipcbiAqIEV4cG9zZSBgcmVxdWVzdGAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobWV0aG9kLCB1cmwpIHtcbiAgLy8gY2FsbGJhY2tcbiAgaWYgKHR5cGVvZiB1cmwgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gbmV3IGV4cG9ydHMuUmVxdWVzdCgnR0VUJywgbWV0aG9kKS5lbmQodXJsKTtcbiAgfVxuXG4gIC8vIHVybCBmaXJzdFxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiBuZXcgZXhwb3J0cy5SZXF1ZXN0KCdHRVQnLCBtZXRob2QpO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBleHBvcnRzLlJlcXVlc3QobWV0aG9kLCB1cmwpO1xufTtcblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzO1xuXG5jb25zdCByZXF1ZXN0ID0gZXhwb3J0cztcblxuZXhwb3J0cy5SZXF1ZXN0ID0gUmVxdWVzdDtcblxuLyoqXG4gKiBEZXRlcm1pbmUgWEhSLlxuICovXG5cbnJlcXVlc3QuZ2V0WEhSID0gKCkgPT4ge1xuICBpZiAocm9vdC5YTUxIdHRwUmVxdWVzdCkge1xuICAgIHJldHVybiBuZXcgcm9vdC5YTUxIdHRwUmVxdWVzdCgpO1xuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKCdCcm93c2VyLW9ubHkgdmVyc2lvbiBvZiBzdXBlcmFnZW50IGNvdWxkIG5vdCBmaW5kIFhIUicpO1xufTtcblxuLyoqXG4gKiBSZW1vdmVzIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlc3BhY2UsIGFkZGVkIHRvIHN1cHBvcnQgSUUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmNvbnN0IHRyaW0gPSAnJy50cmltID8gKHMpID0+IHMudHJpbSgpIDogKHMpID0+IHMucmVwbGFjZSgvKF5cXHMqfFxccyokKS9nLCAnJyk7XG5cbi8qKlxuICogU2VyaWFsaXplIHRoZSBnaXZlbiBgb2JqYC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzZXJpYWxpemUob2JqZWN0KSB7XG4gIGlmICghaXNPYmplY3Qob2JqZWN0KSkgcmV0dXJuIG9iamVjdDtcbiAgY29uc3QgcGFpcnMgPSBbXTtcbiAgZm9yIChjb25zdCBrZXkgaW4gb2JqZWN0KSB7XG4gICAgaWYgKGhhc093bihvYmplY3QsIGtleSkpIHB1c2hFbmNvZGVkS2V5VmFsdWVQYWlyKHBhaXJzLCBrZXksIG9iamVjdFtrZXldKTtcbiAgfVxuXG4gIHJldHVybiBwYWlycy5qb2luKCcmJyk7XG59XG5cbi8qKlxuICogSGVscHMgJ3NlcmlhbGl6ZScgd2l0aCBzZXJpYWxpemluZyBhcnJheXMuXG4gKiBNdXRhdGVzIHRoZSBwYWlycyBhcnJheS5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBwYWlyc1xuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHtNaXhlZH0gdmFsXG4gKi9cblxuZnVuY3Rpb24gcHVzaEVuY29kZWRLZXlWYWx1ZVBhaXIocGFpcnMsIGtleSwgdmFsdWUpIHtcbiAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHJldHVybjtcbiAgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgcGFpcnMucHVzaChlbmNvZGVVUkkoa2V5KSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgZm9yIChjb25zdCB2IG9mIHZhbHVlKSB7XG4gICAgICBwdXNoRW5jb2RlZEtleVZhbHVlUGFpcihwYWlycywga2V5LCB2KTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QodmFsdWUpKSB7XG4gICAgZm9yIChjb25zdCBzdWJrZXkgaW4gdmFsdWUpIHtcbiAgICAgIGlmIChoYXNPd24odmFsdWUsIHN1YmtleSkpXG4gICAgICAgIHB1c2hFbmNvZGVkS2V5VmFsdWVQYWlyKHBhaXJzLCBgJHtrZXl9WyR7c3Via2V5fV1gLCB2YWx1ZVtzdWJrZXldKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcGFpcnMucHVzaChlbmNvZGVVUkkoa2V5KSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpO1xuICB9XG59XG5cbi8qKlxuICogRXhwb3NlIHNlcmlhbGl6YXRpb24gbWV0aG9kLlxuICovXG5cbnJlcXVlc3Quc2VyaWFsaXplT2JqZWN0ID0gc2VyaWFsaXplO1xuXG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiB4LXd3dy1mb3JtLXVybGVuY29kZWQgYHN0cmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcGFyc2VTdHJpbmcoc3RyaW5nXykge1xuICBjb25zdCBvYmplY3QgPSB7fTtcbiAgY29uc3QgcGFpcnMgPSBzdHJpbmdfLnNwbGl0KCcmJyk7XG4gIGxldCBwYWlyO1xuICBsZXQgcG9zO1xuXG4gIGZvciAobGV0IGkgPSAwLCBsZW5ndGhfID0gcGFpcnMubGVuZ3RoOyBpIDwgbGVuZ3RoXzsgKytpKSB7XG4gICAgcGFpciA9IHBhaXJzW2ldO1xuICAgIHBvcyA9IHBhaXIuaW5kZXhPZignPScpO1xuICAgIGlmIChwb3MgPT09IC0xKSB7XG4gICAgICBvYmplY3RbZGVjb2RlVVJJQ29tcG9uZW50KHBhaXIpXSA9ICcnO1xuICAgIH0gZWxzZSB7XG4gICAgICBvYmplY3RbZGVjb2RlVVJJQ29tcG9uZW50KHBhaXIuc2xpY2UoMCwgcG9zKSldID0gZGVjb2RlVVJJQ29tcG9uZW50KFxuICAgICAgICBwYWlyLnNsaWNlKHBvcyArIDEpXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvYmplY3Q7XG59XG5cbi8qKlxuICogRXhwb3NlIHBhcnNlci5cbiAqL1xuXG5yZXF1ZXN0LnBhcnNlU3RyaW5nID0gcGFyc2VTdHJpbmc7XG5cbi8qKlxuICogRGVmYXVsdCBNSU1FIHR5cGUgbWFwLlxuICpcbiAqICAgICBzdXBlcmFnZW50LnR5cGVzLnhtbCA9ICdhcHBsaWNhdGlvbi94bWwnO1xuICpcbiAqL1xuXG5yZXF1ZXN0LnR5cGVzID0ge1xuICBodG1sOiAndGV4dC9odG1sJyxcbiAganNvbjogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICB4bWw6ICd0ZXh0L3htbCcsXG4gIHVybGVuY29kZWQ6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICBmb3JtOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgJ2Zvcm0tZGF0YSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG4vKipcbiAqIERlZmF1bHQgc2VyaWFsaXphdGlvbiBtYXAuXG4gKlxuICogICAgIHN1cGVyYWdlbnQuc2VyaWFsaXplWydhcHBsaWNhdGlvbi94bWwnXSA9IGZ1bmN0aW9uKG9iail7XG4gKiAgICAgICByZXR1cm4gJ2dlbmVyYXRlZCB4bWwgaGVyZSc7XG4gKiAgICAgfTtcbiAqXG4gKi9cblxucmVxdWVzdC5zZXJpYWxpemUgPSB7XG4gICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnOiBxcy5zdHJpbmdpZnksXG4gICdhcHBsaWNhdGlvbi9qc29uJzogc2FmZVN0cmluZ2lmeVxufTtcblxuLyoqXG4gKiBEZWZhdWx0IHBhcnNlcnMuXG4gKlxuICogICAgIHN1cGVyYWdlbnQucGFyc2VbJ2FwcGxpY2F0aW9uL3htbCddID0gZnVuY3Rpb24oc3RyKXtcbiAqICAgICAgIHJldHVybiB7IG9iamVjdCBwYXJzZWQgZnJvbSBzdHIgfTtcbiAqICAgICB9O1xuICpcbiAqL1xuXG5yZXF1ZXN0LnBhcnNlID0ge1xuICAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJzogcGFyc2VTdHJpbmcsXG4gICdhcHBsaWNhdGlvbi9qc29uJzogSlNPTi5wYXJzZVxufTtcblxuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gaGVhZGVyIGBzdHJgIGludG9cbiAqIGFuIG9iamVjdCBjb250YWluaW5nIHRoZSBtYXBwZWQgZmllbGRzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlSGVhZGVyKHN0cmluZ18pIHtcbiAgY29uc3QgbGluZXMgPSBzdHJpbmdfLnNwbGl0KC9cXHI/XFxuLyk7XG4gIGNvbnN0IGZpZWxkcyA9IHt9O1xuICBsZXQgaW5kZXg7XG4gIGxldCBsaW5lO1xuICBsZXQgZmllbGQ7XG4gIGxldCB2YWx1ZTtcblxuICBmb3IgKGxldCBpID0gMCwgbGVuZ3RoXyA9IGxpbmVzLmxlbmd0aDsgaSA8IGxlbmd0aF87ICsraSkge1xuICAgIGxpbmUgPSBsaW5lc1tpXTtcbiAgICBpbmRleCA9IGxpbmUuaW5kZXhPZignOicpO1xuICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgIC8vIGNvdWxkIGJlIGVtcHR5IGxpbmUsIGp1c3Qgc2tpcCBpdFxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgZmllbGQgPSBsaW5lLnNsaWNlKDAsIGluZGV4KS50b0xvd2VyQ2FzZSgpO1xuICAgIHZhbHVlID0gdHJpbShsaW5lLnNsaWNlKGluZGV4ICsgMSkpO1xuICAgIGZpZWxkc1tmaWVsZF0gPSB2YWx1ZTtcbiAgfVxuXG4gIHJldHVybiBmaWVsZHM7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgYG1pbWVgIGlzIGpzb24gb3IgaGFzICtqc29uIHN0cnVjdHVyZWQgc3ludGF4IHN1ZmZpeC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWltZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzSlNPTihtaW1lKSB7XG4gIC8vIHNob3VsZCBtYXRjaCAvanNvbiBvciAranNvblxuICAvLyBidXQgbm90IC9qc29uLXNlcVxuICByZXR1cm4gL1svK11qc29uKCR8W14tXFx3XSkvaS50ZXN0KG1pbWUpO1xufVxuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYFJlc3BvbnNlYCB3aXRoIHRoZSBnaXZlbiBgeGhyYC5cbiAqXG4gKiAgLSBzZXQgZmxhZ3MgKC5vaywgLmVycm9yLCBldGMpXG4gKiAgLSBwYXJzZSBoZWFkZXJcbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgQWxpYXNpbmcgYHN1cGVyYWdlbnRgIGFzIGByZXF1ZXN0YCBpcyBuaWNlOlxuICpcbiAqICAgICAgcmVxdWVzdCA9IHN1cGVyYWdlbnQ7XG4gKlxuICogIFdlIGNhbiB1c2UgdGhlIHByb21pc2UtbGlrZSBBUEksIG9yIHBhc3MgY2FsbGJhY2tzOlxuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy8nKS5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqICAgICAgcmVxdWVzdC5nZXQoJy8nLCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqICBTZW5kaW5nIGRhdGEgY2FuIGJlIGNoYWluZWQ6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJylcbiAqICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogIE9yIHBhc3NlZCB0byBgLnNlbmQoKWA6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJylcbiAqICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSwgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiAgT3IgcGFzc2VkIHRvIGAucG9zdCgpYDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInLCB7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogT3IgZnVydGhlciByZWR1Y2VkIHRvIGEgc2luZ2xlIGNhbGwgZm9yIHNpbXBsZSBjYXNlczpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInLCB7IG5hbWU6ICd0aicgfSwgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiBAcGFyYW0ge1hNTEhUVFBSZXF1ZXN0fSB4aHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBSZXNwb25zZShyZXF1ZXN0Xykge1xuICB0aGlzLnJlcSA9IHJlcXVlc3RfO1xuICB0aGlzLnhociA9IHRoaXMucmVxLnhocjtcbiAgLy8gcmVzcG9uc2VUZXh0IGlzIGFjY2Vzc2libGUgb25seSBpZiByZXNwb25zZVR5cGUgaXMgJycgb3IgJ3RleHQnIGFuZCBvbiBvbGRlciBicm93c2Vyc1xuICB0aGlzLnRleHQgPVxuICAgICh0aGlzLnJlcS5tZXRob2QgIT09ICdIRUFEJyAmJlxuICAgICAgKHRoaXMueGhyLnJlc3BvbnNlVHlwZSA9PT0gJycgfHwgdGhpcy54aHIucmVzcG9uc2VUeXBlID09PSAndGV4dCcpKSB8fFxuICAgIHR5cGVvZiB0aGlzLnhoci5yZXNwb25zZVR5cGUgPT09ICd1bmRlZmluZWQnXG4gICAgICA/IHRoaXMueGhyLnJlc3BvbnNlVGV4dFxuICAgICAgOiBudWxsO1xuICB0aGlzLnN0YXR1c1RleHQgPSB0aGlzLnJlcS54aHIuc3RhdHVzVGV4dDtcbiAgbGV0IHsgc3RhdHVzIH0gPSB0aGlzLnhocjtcbiAgLy8gaGFuZGxlIElFOSBidWc6IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTAwNDY5NzIvbXNpZS1yZXR1cm5zLXN0YXR1cy1jb2RlLW9mLTEyMjMtZm9yLWFqYXgtcmVxdWVzdFxuICBpZiAoc3RhdHVzID09PSAxMjIzKSB7XG4gICAgc3RhdHVzID0gMjA0O1xuICB9XG5cbiAgdGhpcy5fc2V0U3RhdHVzUHJvcGVydGllcyhzdGF0dXMpO1xuICB0aGlzLmhlYWRlcnMgPSBwYXJzZUhlYWRlcih0aGlzLnhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSk7XG4gIHRoaXMuaGVhZGVyID0gdGhpcy5oZWFkZXJzO1xuICAvLyBnZXRBbGxSZXNwb25zZUhlYWRlcnMgc29tZXRpbWVzIGZhbHNlbHkgcmV0dXJucyBcIlwiIGZvciBDT1JTIHJlcXVlc3RzLCBidXRcbiAgLy8gZ2V0UmVzcG9uc2VIZWFkZXIgc3RpbGwgd29ya3MuIHNvIHdlIGdldCBjb250ZW50LXR5cGUgZXZlbiBpZiBnZXR0aW5nXG4gIC8vIG90aGVyIGhlYWRlcnMgZmFpbHMuXG4gIHRoaXMuaGVhZGVyWydjb250ZW50LXR5cGUnXSA9IHRoaXMueGhyLmdldFJlc3BvbnNlSGVhZGVyKCdjb250ZW50LXR5cGUnKTtcbiAgdGhpcy5fc2V0SGVhZGVyUHJvcGVydGllcyh0aGlzLmhlYWRlcik7XG5cbiAgaWYgKHRoaXMudGV4dCA9PT0gbnVsbCAmJiByZXF1ZXN0Xy5fcmVzcG9uc2VUeXBlKSB7XG4gICAgdGhpcy5ib2R5ID0gdGhpcy54aHIucmVzcG9uc2U7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5ib2R5ID1cbiAgICAgIHRoaXMucmVxLm1ldGhvZCA9PT0gJ0hFQUQnXG4gICAgICAgID8gbnVsbFxuICAgICAgICA6IHRoaXMuX3BhcnNlQm9keSh0aGlzLnRleHQgPyB0aGlzLnRleHQgOiB0aGlzLnhoci5yZXNwb25zZSk7XG4gIH1cbn1cblxubWl4aW4oUmVzcG9uc2UucHJvdG90eXBlLCBSZXNwb25zZUJhc2UucHJvdG90eXBlKTtcblxuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gYm9keSBgc3RyYC5cbiAqXG4gKiBVc2VkIGZvciBhdXRvLXBhcnNpbmcgb2YgYm9kaWVzLiBQYXJzZXJzXG4gKiBhcmUgZGVmaW5lZCBvbiB0aGUgYHN1cGVyYWdlbnQucGFyc2VgIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtNaXhlZH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5fcGFyc2VCb2R5ID0gZnVuY3Rpb24gKHN0cmluZ18pIHtcbiAgbGV0IHBhcnNlID0gcmVxdWVzdC5wYXJzZVt0aGlzLnR5cGVdO1xuICBpZiAodGhpcy5yZXEuX3BhcnNlcikge1xuICAgIHJldHVybiB0aGlzLnJlcS5fcGFyc2VyKHRoaXMsIHN0cmluZ18pO1xuICB9XG5cbiAgaWYgKCFwYXJzZSAmJiBpc0pTT04odGhpcy50eXBlKSkge1xuICAgIHBhcnNlID0gcmVxdWVzdC5wYXJzZVsnYXBwbGljYXRpb24vanNvbiddO1xuICB9XG5cbiAgcmV0dXJuIHBhcnNlICYmIHN0cmluZ18gJiYgKHN0cmluZ18ubGVuZ3RoID4gMCB8fCBzdHJpbmdfIGluc3RhbmNlb2YgT2JqZWN0KVxuICAgID8gcGFyc2Uoc3RyaW5nXylcbiAgICA6IG51bGw7XG59O1xuXG4vKipcbiAqIFJldHVybiBhbiBgRXJyb3JgIHJlcHJlc2VudGF0aXZlIG9mIHRoaXMgcmVzcG9uc2UuXG4gKlxuICogQHJldHVybiB7RXJyb3J9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS50b0Vycm9yID0gZnVuY3Rpb24gKCkge1xuICBjb25zdCB7IHJlcSB9ID0gdGhpcztcbiAgY29uc3QgeyBtZXRob2QgfSA9IHJlcTtcbiAgY29uc3QgeyB1cmwgfSA9IHJlcTtcblxuICBjb25zdCBtZXNzYWdlID0gYGNhbm5vdCAke21ldGhvZH0gJHt1cmx9ICgke3RoaXMuc3RhdHVzfSlgO1xuICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgZXJyb3Iuc3RhdHVzID0gdGhpcy5zdGF0dXM7XG4gIGVycm9yLm1ldGhvZCA9IG1ldGhvZDtcbiAgZXJyb3IudXJsID0gdXJsO1xuXG4gIHJldHVybiBlcnJvcjtcbn07XG5cbi8qKlxuICogRXhwb3NlIGBSZXNwb25zZWAuXG4gKi9cblxucmVxdWVzdC5SZXNwb25zZSA9IFJlc3BvbnNlO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYFJlcXVlc3RgIHdpdGggdGhlIGdpdmVuIGBtZXRob2RgIGFuZCBgdXJsYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIFJlcXVlc3QobWV0aG9kLCB1cmwpIHtcbiAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gIHRoaXMuX3F1ZXJ5ID0gdGhpcy5fcXVlcnkgfHwgW107XG4gIHRoaXMubWV0aG9kID0gbWV0aG9kO1xuICB0aGlzLnVybCA9IHVybDtcbiAgdGhpcy5oZWFkZXIgPSB7fTsgLy8gcHJlc2VydmVzIGhlYWRlciBuYW1lIGNhc2VcbiAgdGhpcy5faGVhZGVyID0ge307IC8vIGNvZXJjZXMgaGVhZGVyIG5hbWVzIHRvIGxvd2VyY2FzZVxuICB0aGlzLm9uKCdlbmQnLCAoKSA9PiB7XG4gICAgbGV0IGVycm9yID0gbnVsbDtcbiAgICBsZXQgcmVzID0gbnVsbDtcblxuICAgIHRyeSB7XG4gICAgICByZXMgPSBuZXcgUmVzcG9uc2Uoc2VsZik7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBlcnJvciA9IG5ldyBFcnJvcignUGFyc2VyIGlzIHVuYWJsZSB0byBwYXJzZSB0aGUgcmVzcG9uc2UnKTtcbiAgICAgIGVycm9yLnBhcnNlID0gdHJ1ZTtcbiAgICAgIGVycm9yLm9yaWdpbmFsID0gZXJyO1xuICAgICAgLy8gaXNzdWUgIzY3NTogcmV0dXJuIHRoZSByYXcgcmVzcG9uc2UgaWYgdGhlIHJlc3BvbnNlIHBhcnNpbmcgZmFpbHNcbiAgICAgIGlmIChzZWxmLnhocikge1xuICAgICAgICAvLyBpZTkgZG9lc24ndCBoYXZlICdyZXNwb25zZScgcHJvcGVydHlcbiAgICAgICAgZXJyb3IucmF3UmVzcG9uc2UgPVxuICAgICAgICAgIHR5cGVvZiBzZWxmLnhoci5yZXNwb25zZVR5cGUgPT09ICd1bmRlZmluZWQnXG4gICAgICAgICAgICA/IHNlbGYueGhyLnJlc3BvbnNlVGV4dFxuICAgICAgICAgICAgOiBzZWxmLnhoci5yZXNwb25zZTtcbiAgICAgICAgLy8gaXNzdWUgIzg3NjogcmV0dXJuIHRoZSBodHRwIHN0YXR1cyBjb2RlIGlmIHRoZSByZXNwb25zZSBwYXJzaW5nIGZhaWxzXG4gICAgICAgIGVycm9yLnN0YXR1cyA9IHNlbGYueGhyLnN0YXR1cyA/IHNlbGYueGhyLnN0YXR1cyA6IG51bGw7XG4gICAgICAgIGVycm9yLnN0YXR1c0NvZGUgPSBlcnJvci5zdGF0dXM7IC8vIGJhY2t3YXJkcy1jb21wYXQgb25seVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZXJyb3IucmF3UmVzcG9uc2UgPSBudWxsO1xuICAgICAgICBlcnJvci5zdGF0dXMgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZi5jYWxsYmFjayhlcnJvcik7XG4gICAgfVxuXG4gICAgc2VsZi5lbWl0KCdyZXNwb25zZScsIHJlcyk7XG5cbiAgICBsZXQgbmV3X2Vycm9yO1xuICAgIHRyeSB7XG4gICAgICBpZiAoIXNlbGYuX2lzUmVzcG9uc2VPSyhyZXMpKSB7XG4gICAgICAgIG5ld19lcnJvciA9IG5ldyBFcnJvcihcbiAgICAgICAgICByZXMuc3RhdHVzVGV4dCB8fCByZXMudGV4dCB8fCAnVW5zdWNjZXNzZnVsIEhUVFAgcmVzcG9uc2UnXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBuZXdfZXJyb3IgPSBlcnI7IC8vIG9rKCkgY2FsbGJhY2sgY2FuIHRocm93XG4gICAgfVxuXG4gICAgLy8gIzEwMDAgZG9uJ3QgY2F0Y2ggZXJyb3JzIGZyb20gdGhlIGNhbGxiYWNrIHRvIGF2b2lkIGRvdWJsZSBjYWxsaW5nIGl0XG4gICAgaWYgKG5ld19lcnJvcikge1xuICAgICAgbmV3X2Vycm9yLm9yaWdpbmFsID0gZXJyb3I7XG4gICAgICBuZXdfZXJyb3IucmVzcG9uc2UgPSByZXM7XG4gICAgICBuZXdfZXJyb3Iuc3RhdHVzID0gbmV3X2Vycm9yLnN0YXR1cyB8fCByZXMuc3RhdHVzO1xuICAgICAgc2VsZi5jYWxsYmFjayhuZXdfZXJyb3IsIHJlcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGYuY2FsbGJhY2sobnVsbCwgcmVzKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIE1peGluIGBFbWl0dGVyYCBhbmQgYFJlcXVlc3RCYXNlYC5cbiAqL1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbmV3LWNhcFxuRW1pdHRlcihSZXF1ZXN0LnByb3RvdHlwZSk7XG5cbm1peGluKFJlcXVlc3QucHJvdG90eXBlLCBSZXF1ZXN0QmFzZS5wcm90b3R5cGUpO1xuXG4vKipcbiAqIFNldCBDb250ZW50LVR5cGUgdG8gYHR5cGVgLCBtYXBwaW5nIHZhbHVlcyBmcm9tIGByZXF1ZXN0LnR5cGVzYC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHN1cGVyYWdlbnQudHlwZXMueG1sID0gJ2FwcGxpY2F0aW9uL3htbCc7XG4gKlxuICogICAgICByZXF1ZXN0LnBvc3QoJy8nKVxuICogICAgICAgIC50eXBlKCd4bWwnKVxuICogICAgICAgIC5zZW5kKHhtbHN0cmluZylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcXVlc3QucG9zdCgnLycpXG4gKiAgICAgICAgLnR5cGUoJ2FwcGxpY2F0aW9uL3htbCcpXG4gKiAgICAgICAgLnNlbmQoeG1sc3RyaW5nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudHlwZSA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gIHRoaXMuc2V0KCdDb250ZW50LVR5cGUnLCByZXF1ZXN0LnR5cGVzW3R5cGVdIHx8IHR5cGUpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IEFjY2VwdCB0byBgdHlwZWAsIG1hcHBpbmcgdmFsdWVzIGZyb20gYHJlcXVlc3QudHlwZXNgLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgc3VwZXJhZ2VudC50eXBlcy5qc29uID0gJ2FwcGxpY2F0aW9uL2pzb24nO1xuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy9hZ2VudCcpXG4gKiAgICAgICAgLmFjY2VwdCgnanNvbicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogICAgICByZXF1ZXN0LmdldCgnL2FnZW50JylcbiAqICAgICAgICAuYWNjZXB0KCdhcHBsaWNhdGlvbi9qc29uJylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gYWNjZXB0XG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYWNjZXB0ID0gZnVuY3Rpb24gKHR5cGUpIHtcbiAgdGhpcy5zZXQoJ0FjY2VwdCcsIHJlcXVlc3QudHlwZXNbdHlwZV0gfHwgdHlwZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgQXV0aG9yaXphdGlvbiBmaWVsZCB2YWx1ZSB3aXRoIGB1c2VyYCBhbmQgYHBhc3NgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1c2VyXG4gKiBAcGFyYW0ge1N0cmluZ30gW3Bhc3NdIG9wdGlvbmFsIGluIGNhc2Ugb2YgdXNpbmcgJ2JlYXJlcicgYXMgdHlwZVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgd2l0aCAndHlwZScgcHJvcGVydHkgJ2F1dG8nLCAnYmFzaWMnIG9yICdiZWFyZXInIChkZWZhdWx0ICdiYXNpYycpXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYXV0aCA9IGZ1bmN0aW9uICh1c2VyLCBwYXNzLCBvcHRpb25zKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSBwYXNzID0gJyc7XG4gIGlmICh0eXBlb2YgcGFzcyA9PT0gJ29iamVjdCcgJiYgcGFzcyAhPT0gbnVsbCkge1xuICAgIC8vIHBhc3MgaXMgb3B0aW9uYWwgYW5kIGNhbiBiZSByZXBsYWNlZCB3aXRoIG9wdGlvbnNcbiAgICBvcHRpb25zID0gcGFzcztcbiAgICBwYXNzID0gJyc7XG4gIH1cblxuICBpZiAoIW9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0ge1xuICAgICAgdHlwZTogdHlwZW9mIGJ0b2EgPT09ICdmdW5jdGlvbicgPyAnYmFzaWMnIDogJ2F1dG8nXG4gICAgfTtcbiAgfVxuXG4gIGNvbnN0IGVuY29kZXIgPSBvcHRpb25zLmVuY29kZXJcbiAgICA/IG9wdGlvbnMuZW5jb2RlclxuICAgIDogKHN0cmluZykgPT4ge1xuICAgICAgICBpZiAodHlwZW9mIGJ0b2EgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICByZXR1cm4gYnRvYShzdHJpbmcpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgdXNlIGJhc2ljIGF1dGgsIGJ0b2EgaXMgbm90IGEgZnVuY3Rpb24nKTtcbiAgICAgIH07XG5cbiAgcmV0dXJuIHRoaXMuX2F1dGgodXNlciwgcGFzcywgb3B0aW9ucywgZW5jb2Rlcik7XG59O1xuXG4vKipcbiAqIEFkZCBxdWVyeS1zdHJpbmcgYHZhbGAuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICByZXF1ZXN0LmdldCgnL3Nob2VzJylcbiAqICAgICAucXVlcnkoJ3NpemU9MTAnKVxuICogICAgIC5xdWVyeSh7IGNvbG9yOiAnYmx1ZScgfSlcbiAqXG4gKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IHZhbFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnF1ZXJ5ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB2YWx1ZSA9IHNlcmlhbGl6ZSh2YWx1ZSk7XG4gIGlmICh2YWx1ZSkgdGhpcy5fcXVlcnkucHVzaCh2YWx1ZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBRdWV1ZSB0aGUgZ2l2ZW4gYGZpbGVgIGFzIGFuIGF0dGFjaG1lbnQgdG8gdGhlIHNwZWNpZmllZCBgZmllbGRgLFxuICogd2l0aCBvcHRpb25hbCBgb3B0aW9uc2AgKG9yIGZpbGVuYW1lKS5cbiAqXG4gKiBgYGAganNcbiAqIHJlcXVlc3QucG9zdCgnL3VwbG9hZCcpXG4gKiAgIC5hdHRhY2goJ2NvbnRlbnQnLCBuZXcgQmxvYihbJzxhIGlkPVwiYVwiPjxiIGlkPVwiYlwiPmhleSE8L2I+PC9hPiddLCB7IHR5cGU6IFwidGV4dC9odG1sXCJ9KSlcbiAqICAgLmVuZChjYWxsYmFjayk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEBwYXJhbSB7QmxvYnxGaWxlfSBmaWxlXG4gKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hdHRhY2ggPSBmdW5jdGlvbiAoZmllbGQsIGZpbGUsIG9wdGlvbnMpIHtcbiAgaWYgKGZpbGUpIHtcbiAgICBpZiAodGhpcy5fZGF0YSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwic3VwZXJhZ2VudCBjYW4ndCBtaXggLnNlbmQoKSBhbmQgLmF0dGFjaCgpXCIpO1xuICAgIH1cblxuICAgIHRoaXMuX2dldEZvcm1EYXRhKCkuYXBwZW5kKGZpZWxkLCBmaWxlLCBvcHRpb25zIHx8IGZpbGUubmFtZSk7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cblJlcXVlc3QucHJvdG90eXBlLl9nZXRGb3JtRGF0YSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKCF0aGlzLl9mb3JtRGF0YSkge1xuICAgIHRoaXMuX2Zvcm1EYXRhID0gbmV3IHJvb3QuRm9ybURhdGEoKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLl9mb3JtRGF0YTtcbn07XG5cbi8qKlxuICogSW52b2tlIHRoZSBjYWxsYmFjayB3aXRoIGBlcnJgIGFuZCBgcmVzYFxuICogYW5kIGhhbmRsZSBhcml0eSBjaGVjay5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJcbiAqIEBwYXJhbSB7UmVzcG9uc2V9IHJlc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY2FsbGJhY2sgPSBmdW5jdGlvbiAoZXJyb3IsIHJlcykge1xuICBpZiAodGhpcy5fc2hvdWxkUmV0cnkoZXJyb3IsIHJlcykpIHtcbiAgICByZXR1cm4gdGhpcy5fcmV0cnkoKTtcbiAgfVxuXG4gIGNvbnN0IGZuID0gdGhpcy5fY2FsbGJhY2s7XG4gIHRoaXMuY2xlYXJUaW1lb3V0KCk7XG5cbiAgaWYgKGVycm9yKSB7XG4gICAgaWYgKHRoaXMuX21heFJldHJpZXMpIGVycm9yLnJldHJpZXMgPSB0aGlzLl9yZXRyaWVzIC0gMTtcbiAgICB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyb3IpO1xuICB9XG5cbiAgZm4oZXJyb3IsIHJlcyk7XG59O1xuXG4vKipcbiAqIEludm9rZSBjYWxsYmFjayB3aXRoIHgtZG9tYWluIGVycm9yLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmNyb3NzRG9tYWluRXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKFxuICAgICdSZXF1ZXN0IGhhcyBiZWVuIHRlcm1pbmF0ZWRcXG5Qb3NzaWJsZSBjYXVzZXM6IHRoZSBuZXR3b3JrIGlzIG9mZmxpbmUsIE9yaWdpbiBpcyBub3QgYWxsb3dlZCBieSBBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4sIHRoZSBwYWdlIGlzIGJlaW5nIHVubG9hZGVkLCBldGMuJ1xuICApO1xuICBlcnJvci5jcm9zc0RvbWFpbiA9IHRydWU7XG5cbiAgZXJyb3Iuc3RhdHVzID0gdGhpcy5zdGF0dXM7XG4gIGVycm9yLm1ldGhvZCA9IHRoaXMubWV0aG9kO1xuICBlcnJvci51cmwgPSB0aGlzLnVybDtcblxuICB0aGlzLmNhbGxiYWNrKGVycm9yKTtcbn07XG5cbi8vIFRoaXMgb25seSB3YXJucywgYmVjYXVzZSB0aGUgcmVxdWVzdCBpcyBzdGlsbCBsaWtlbHkgdG8gd29ya1xuUmVxdWVzdC5wcm90b3R5cGUuYWdlbnQgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnNvbGUud2FybignVGhpcyBpcyBub3Qgc3VwcG9ydGVkIGluIGJyb3dzZXIgdmVyc2lvbiBvZiBzdXBlcmFnZW50Jyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuUmVxdWVzdC5wcm90b3R5cGUuY2EgPSBSZXF1ZXN0LnByb3RvdHlwZS5hZ2VudDtcblJlcXVlc3QucHJvdG90eXBlLmJ1ZmZlciA9IFJlcXVlc3QucHJvdG90eXBlLmNhO1xuXG4vLyBUaGlzIHRocm93cywgYmVjYXVzZSBpdCBjYW4ndCBzZW5kL3JlY2VpdmUgZGF0YSBhcyBleHBlY3RlZFxuUmVxdWVzdC5wcm90b3R5cGUud3JpdGUgPSAoKSA9PiB7XG4gIHRocm93IG5ldyBFcnJvcihcbiAgICAnU3RyZWFtaW5nIGlzIG5vdCBzdXBwb3J0ZWQgaW4gYnJvd3NlciB2ZXJzaW9uIG9mIHN1cGVyYWdlbnQnXG4gICk7XG59O1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5waXBlID0gUmVxdWVzdC5wcm90b3R5cGUud3JpdGU7XG5cbi8qKlxuICogQ2hlY2sgaWYgYG9iamAgaXMgYSBob3N0IG9iamVjdCxcbiAqIHdlIGRvbid0IHdhbnQgdG8gc2VyaWFsaXplIHRoZXNlIDopXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBob3N0IG9iamVjdFxuICogQHJldHVybiB7Qm9vbGVhbn0gaXMgYSBob3N0IG9iamVjdFxuICogQGFwaSBwcml2YXRlXG4gKi9cblJlcXVlc3QucHJvdG90eXBlLl9pc0hvc3QgPSBmdW5jdGlvbiAob2JqZWN0KSB7XG4gIC8vIE5hdGl2ZSBvYmplY3RzIHN0cmluZ2lmeSB0byBbb2JqZWN0IEZpbGVdLCBbb2JqZWN0IEJsb2JdLCBbb2JqZWN0IEZvcm1EYXRhXSwgZXRjLlxuICByZXR1cm4gKFxuICAgIG9iamVjdCAmJlxuICAgIHR5cGVvZiBvYmplY3QgPT09ICdvYmplY3QnICYmXG4gICAgIUFycmF5LmlzQXJyYXkob2JqZWN0KSAmJlxuICAgIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmplY3QpICE9PSAnW29iamVjdCBPYmplY3RdJ1xuICApO1xufTtcblxuLyoqXG4gKiBJbml0aWF0ZSByZXF1ZXN0LCBpbnZva2luZyBjYWxsYmFjayBgZm4ocmVzKWBcbiAqIHdpdGggYW4gaW5zdGFuY2VvZiBgUmVzcG9uc2VgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuZW5kID0gZnVuY3Rpb24gKGZuKSB7XG4gIGlmICh0aGlzLl9lbmRDYWxsZWQpIHtcbiAgICBjb25zb2xlLndhcm4oXG4gICAgICAnV2FybmluZzogLmVuZCgpIHdhcyBjYWxsZWQgdHdpY2UuIFRoaXMgaXMgbm90IHN1cHBvcnRlZCBpbiBzdXBlcmFnZW50J1xuICAgICk7XG4gIH1cblxuICB0aGlzLl9lbmRDYWxsZWQgPSB0cnVlO1xuXG4gIC8vIHN0b3JlIGNhbGxiYWNrXG4gIHRoaXMuX2NhbGxiYWNrID0gZm4gfHwgbm9vcDtcblxuICAvLyBxdWVyeXN0cmluZ1xuICB0aGlzLl9maW5hbGl6ZVF1ZXJ5U3RyaW5nKCk7XG5cbiAgdGhpcy5fZW5kKCk7XG59O1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5fc2V0VXBsb2FkVGltZW91dCA9IGZ1bmN0aW9uICgpIHtcbiAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgLy8gdXBsb2FkIHRpbWVvdXQgaXQncyB3b2tycyBvbmx5IGlmIGRlYWRsaW5lIHRpbWVvdXQgaXMgb2ZmXG4gIGlmICh0aGlzLl91cGxvYWRUaW1lb3V0ICYmICF0aGlzLl91cGxvYWRUaW1lb3V0VGltZXIpIHtcbiAgICB0aGlzLl91cGxvYWRUaW1lb3V0VGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHNlbGYuX3RpbWVvdXRFcnJvcihcbiAgICAgICAgJ1VwbG9hZCB0aW1lb3V0IG9mICcsXG4gICAgICAgIHNlbGYuX3VwbG9hZFRpbWVvdXQsXG4gICAgICAgICdFVElNRURPVVQnXG4gICAgICApO1xuICAgIH0sIHRoaXMuX3VwbG9hZFRpbWVvdXQpO1xuICB9XG59O1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29tcGxleGl0eVxuUmVxdWVzdC5wcm90b3R5cGUuX2VuZCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuX2Fib3J0ZWQpXG4gICAgcmV0dXJuIHRoaXMuY2FsbGJhY2soXG4gICAgICBuZXcgRXJyb3IoJ1RoZSByZXF1ZXN0IGhhcyBiZWVuIGFib3J0ZWQgZXZlbiBiZWZvcmUgLmVuZCgpIHdhcyBjYWxsZWQnKVxuICAgICk7XG5cbiAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gIHRoaXMueGhyID0gcmVxdWVzdC5nZXRYSFIoKTtcbiAgY29uc3QgeyB4aHIgfSA9IHRoaXM7XG4gIGxldCBkYXRhID0gdGhpcy5fZm9ybURhdGEgfHwgdGhpcy5fZGF0YTtcblxuICB0aGlzLl9zZXRUaW1lb3V0cygpO1xuXG4gIC8vIHN0YXRlIGNoYW5nZVxuICB4aHIuYWRkRXZlbnRMaXN0ZW5lcigncmVhZHlzdGF0ZWNoYW5nZScsICgpID0+IHtcbiAgICBjb25zdCB7IHJlYWR5U3RhdGUgfSA9IHhocjtcbiAgICBpZiAocmVhZHlTdGF0ZSA+PSAyICYmIHNlbGYuX3Jlc3BvbnNlVGltZW91dFRpbWVyKSB7XG4gICAgICBjbGVhclRpbWVvdXQoc2VsZi5fcmVzcG9uc2VUaW1lb3V0VGltZXIpO1xuICAgIH1cblxuICAgIGlmIChyZWFkeVN0YXRlICE9PSA0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gSW4gSUU5LCByZWFkcyB0byBhbnkgcHJvcGVydHkgKGUuZy4gc3RhdHVzKSBvZmYgb2YgYW4gYWJvcnRlZCBYSFIgd2lsbFxuICAgIC8vIHJlc3VsdCBpbiB0aGUgZXJyb3IgXCJDb3VsZCBub3QgY29tcGxldGUgdGhlIG9wZXJhdGlvbiBkdWUgdG8gZXJyb3IgYzAwYzAyM2ZcIlxuICAgIGxldCBzdGF0dXM7XG4gICAgdHJ5IHtcbiAgICAgIHN0YXR1cyA9IHhoci5zdGF0dXM7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBzdGF0dXMgPSAwO1xuICAgIH1cblxuICAgIGlmICghc3RhdHVzKSB7XG4gICAgICBpZiAoc2VsZi50aW1lZG91dCB8fCBzZWxmLl9hYm9ydGVkKSByZXR1cm47XG4gICAgICByZXR1cm4gc2VsZi5jcm9zc0RvbWFpbkVycm9yKCk7XG4gICAgfVxuXG4gICAgc2VsZi5lbWl0KCdlbmQnKTtcbiAgfSk7XG5cbiAgLy8gcHJvZ3Jlc3NcbiAgY29uc3QgaGFuZGxlUHJvZ3Jlc3MgPSAoZGlyZWN0aW9uLCBlKSA9PiB7XG4gICAgaWYgKGUudG90YWwgPiAwKSB7XG4gICAgICBlLnBlcmNlbnQgPSAoZS5sb2FkZWQgLyBlLnRvdGFsKSAqIDEwMDtcblxuICAgICAgaWYgKGUucGVyY2VudCA9PT0gMTAwKSB7XG4gICAgICAgIGNsZWFyVGltZW91dChzZWxmLl91cGxvYWRUaW1lb3V0VGltZXIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGUuZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xuICAgIHNlbGYuZW1pdCgncHJvZ3Jlc3MnLCBlKTtcbiAgfTtcblxuICBpZiAodGhpcy5oYXNMaXN0ZW5lcnMoJ3Byb2dyZXNzJykpIHtcbiAgICB0cnkge1xuICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgaGFuZGxlUHJvZ3Jlc3MuYmluZChudWxsLCAnZG93bmxvYWQnKSk7XG4gICAgICBpZiAoeGhyLnVwbG9hZCkge1xuICAgICAgICB4aHIudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgICAgJ3Byb2dyZXNzJyxcbiAgICAgICAgICBoYW5kbGVQcm9ncmVzcy5iaW5kKG51bGwsICd1cGxvYWQnKVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgLy8gQWNjZXNzaW5nIHhoci51cGxvYWQgZmFpbHMgaW4gSUUgZnJvbSBhIHdlYiB3b3JrZXIsIHNvIGp1c3QgcHJldGVuZCBpdCBkb2Vzbid0IGV4aXN0LlxuICAgICAgLy8gUmVwb3J0ZWQgaGVyZTpcbiAgICAgIC8vIGh0dHBzOi8vY29ubmVjdC5taWNyb3NvZnQuY29tL0lFL2ZlZWRiYWNrL2RldGFpbHMvODM3MjQ1L3htbGh0dHByZXF1ZXN0LXVwbG9hZC10aHJvd3MtaW52YWxpZC1hcmd1bWVudC13aGVuLXVzZWQtZnJvbS13ZWItd29ya2VyLWNvbnRleHRcbiAgICB9XG4gIH1cblxuICBpZiAoeGhyLnVwbG9hZCkge1xuICAgIHRoaXMuX3NldFVwbG9hZFRpbWVvdXQoKTtcbiAgfVxuXG4gIC8vIGluaXRpYXRlIHJlcXVlc3RcbiAgdHJ5IHtcbiAgICBpZiAodGhpcy51c2VybmFtZSAmJiB0aGlzLnBhc3N3b3JkKSB7XG4gICAgICB4aHIub3Blbih0aGlzLm1ldGhvZCwgdGhpcy51cmwsIHRydWUsIHRoaXMudXNlcm5hbWUsIHRoaXMucGFzc3dvcmQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB4aHIub3Blbih0aGlzLm1ldGhvZCwgdGhpcy51cmwsIHRydWUpO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgLy8gc2VlICMxMTQ5XG4gICAgcmV0dXJuIHRoaXMuY2FsbGJhY2soZXJyKTtcbiAgfVxuXG4gIC8vIENPUlNcbiAgaWYgKHRoaXMuX3dpdGhDcmVkZW50aWFscykgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWU7XG5cbiAgLy8gYm9keVxuICBpZiAoXG4gICAgIXRoaXMuX2Zvcm1EYXRhICYmXG4gICAgdGhpcy5tZXRob2QgIT09ICdHRVQnICYmXG4gICAgdGhpcy5tZXRob2QgIT09ICdIRUFEJyAmJlxuICAgIHR5cGVvZiBkYXRhICE9PSAnc3RyaW5nJyAmJlxuICAgICF0aGlzLl9pc0hvc3QoZGF0YSlcbiAgKSB7XG4gICAgLy8gc2VyaWFsaXplIHN0dWZmXG4gICAgY29uc3QgY29udGVudFR5cGUgPSB0aGlzLl9oZWFkZXJbJ2NvbnRlbnQtdHlwZSddO1xuICAgIGxldCBzZXJpYWxpemUgPVxuICAgICAgdGhpcy5fc2VyaWFsaXplciB8fFxuICAgICAgcmVxdWVzdC5zZXJpYWxpemVbY29udGVudFR5cGUgPyBjb250ZW50VHlwZS5zcGxpdCgnOycpWzBdIDogJyddO1xuICAgIGlmICghc2VyaWFsaXplICYmIGlzSlNPTihjb250ZW50VHlwZSkpIHtcbiAgICAgIHNlcmlhbGl6ZSA9IHJlcXVlc3Quc2VyaWFsaXplWydhcHBsaWNhdGlvbi9qc29uJ107XG4gICAgfVxuXG4gICAgaWYgKHNlcmlhbGl6ZSkgZGF0YSA9IHNlcmlhbGl6ZShkYXRhKTtcbiAgfVxuXG4gIC8vIHNldCBoZWFkZXIgZmllbGRzXG4gIGZvciAoY29uc3QgZmllbGQgaW4gdGhpcy5oZWFkZXIpIHtcbiAgICBpZiAodGhpcy5oZWFkZXJbZmllbGRdID09PSBudWxsKSBjb250aW51ZTtcblxuICAgIGlmIChoYXNPd24odGhpcy5oZWFkZXIsIGZpZWxkKSlcbiAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKGZpZWxkLCB0aGlzLmhlYWRlcltmaWVsZF0pO1xuICB9XG5cbiAgaWYgKHRoaXMuX3Jlc3BvbnNlVHlwZSkge1xuICAgIHhoci5yZXNwb25zZVR5cGUgPSB0aGlzLl9yZXNwb25zZVR5cGU7XG4gIH1cblxuICAvLyBzZW5kIHN0dWZmXG4gIHRoaXMuZW1pdCgncmVxdWVzdCcsIHRoaXMpO1xuXG4gIC8vIElFMTEgeGhyLnNlbmQodW5kZWZpbmVkKSBzZW5kcyAndW5kZWZpbmVkJyBzdHJpbmcgYXMgUE9TVCBwYXlsb2FkIChpbnN0ZWFkIG9mIG5vdGhpbmcpXG4gIC8vIFdlIG5lZWQgbnVsbCBoZXJlIGlmIGRhdGEgaXMgdW5kZWZpbmVkXG4gIHhoci5zZW5kKHR5cGVvZiBkYXRhID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiBkYXRhKTtcbn07XG5cbnJlcXVlc3QuYWdlbnQgPSAoKSA9PiBuZXcgQWdlbnQoKTtcblxuZm9yIChjb25zdCBtZXRob2Qgb2YgWydHRVQnLCAnUE9TVCcsICdPUFRJT05TJywgJ1BBVENIJywgJ1BVVCcsICdERUxFVEUnXSkge1xuICBBZ2VudC5wcm90b3R5cGVbbWV0aG9kLnRvTG93ZXJDYXNlKCldID0gZnVuY3Rpb24gKHVybCwgZm4pIHtcbiAgICBjb25zdCByZXF1ZXN0XyA9IG5ldyByZXF1ZXN0LlJlcXVlc3QobWV0aG9kLCB1cmwpO1xuICAgIHRoaXMuX3NldERlZmF1bHRzKHJlcXVlc3RfKTtcbiAgICBpZiAoZm4pIHtcbiAgICAgIHJlcXVlc3RfLmVuZChmbik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlcXVlc3RfO1xuICB9O1xufVxuXG5BZ2VudC5wcm90b3R5cGUuZGVsID0gQWdlbnQucHJvdG90eXBlLmRlbGV0ZTtcblxuLyoqXG4gKiBHRVQgYHVybGAgd2l0aCBvcHRpb25hbCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gW2RhdGFdIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm5dXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LmdldCA9ICh1cmwsIGRhdGEsIGZuKSA9PiB7XG4gIGNvbnN0IHJlcXVlc3RfID0gcmVxdWVzdCgnR0VUJywgdXJsKTtcbiAgaWYgKHR5cGVvZiBkYXRhID09PSAnZnVuY3Rpb24nKSB7XG4gICAgZm4gPSBkYXRhO1xuICAgIGRhdGEgPSBudWxsO1xuICB9XG5cbiAgaWYgKGRhdGEpIHJlcXVlc3RfLnF1ZXJ5KGRhdGEpO1xuICBpZiAoZm4pIHJlcXVlc3RfLmVuZChmbik7XG4gIHJldHVybiByZXF1ZXN0Xztcbn07XG5cbi8qKlxuICogSEVBRCBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBbZGF0YV0gb3IgZm5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtmbl1cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QuaGVhZCA9ICh1cmwsIGRhdGEsIGZuKSA9PiB7XG4gIGNvbnN0IHJlcXVlc3RfID0gcmVxdWVzdCgnSEVBRCcsIHVybCk7XG4gIGlmICh0eXBlb2YgZGF0YSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGZuID0gZGF0YTtcbiAgICBkYXRhID0gbnVsbDtcbiAgfVxuXG4gIGlmIChkYXRhKSByZXF1ZXN0Xy5xdWVyeShkYXRhKTtcbiAgaWYgKGZuKSByZXF1ZXN0Xy5lbmQoZm4pO1xuICByZXR1cm4gcmVxdWVzdF87XG59O1xuXG4vKipcbiAqIE9QVElPTlMgcXVlcnkgdG8gYHVybGAgd2l0aCBvcHRpb25hbCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gW2RhdGFdIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm5dXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0Lm9wdGlvbnMgPSAodXJsLCBkYXRhLCBmbikgPT4ge1xuICBjb25zdCByZXF1ZXN0XyA9IHJlcXVlc3QoJ09QVElPTlMnLCB1cmwpO1xuICBpZiAodHlwZW9mIGRhdGEgPT09ICdmdW5jdGlvbicpIHtcbiAgICBmbiA9IGRhdGE7XG4gICAgZGF0YSA9IG51bGw7XG4gIH1cblxuICBpZiAoZGF0YSkgcmVxdWVzdF8uc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXF1ZXN0Xy5lbmQoZm4pO1xuICByZXR1cm4gcmVxdWVzdF87XG59O1xuXG4vKipcbiAqIERFTEVURSBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR9IFtkYXRhXVxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2ZuXVxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZGVsKHVybCwgZGF0YSwgZm4pIHtcbiAgY29uc3QgcmVxdWVzdF8gPSByZXF1ZXN0KCdERUxFVEUnLCB1cmwpO1xuICBpZiAodHlwZW9mIGRhdGEgPT09ICdmdW5jdGlvbicpIHtcbiAgICBmbiA9IGRhdGE7XG4gICAgZGF0YSA9IG51bGw7XG4gIH1cblxuICBpZiAoZGF0YSkgcmVxdWVzdF8uc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXF1ZXN0Xy5lbmQoZm4pO1xuICByZXR1cm4gcmVxdWVzdF87XG59XG5cbnJlcXVlc3QuZGVsID0gZGVsO1xucmVxdWVzdC5kZWxldGUgPSBkZWw7XG5cbi8qKlxuICogUEFUQ0ggYHVybGAgd2l0aCBvcHRpb25hbCBgZGF0YWAgYW5kIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfSBbZGF0YV1cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtmbl1cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QucGF0Y2ggPSAodXJsLCBkYXRhLCBmbikgPT4ge1xuICBjb25zdCByZXF1ZXN0XyA9IHJlcXVlc3QoJ1BBVENIJywgdXJsKTtcbiAgaWYgKHR5cGVvZiBkYXRhID09PSAnZnVuY3Rpb24nKSB7XG4gICAgZm4gPSBkYXRhO1xuICAgIGRhdGEgPSBudWxsO1xuICB9XG5cbiAgaWYgKGRhdGEpIHJlcXVlc3RfLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxdWVzdF8uZW5kKGZuKTtcbiAgcmV0dXJuIHJlcXVlc3RfO1xufTtcblxuLyoqXG4gKiBQT1NUIGB1cmxgIHdpdGggb3B0aW9uYWwgYGRhdGFgIGFuZCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZH0gW2RhdGFdXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm5dXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LnBvc3QgPSAodXJsLCBkYXRhLCBmbikgPT4ge1xuICBjb25zdCByZXF1ZXN0XyA9IHJlcXVlc3QoJ1BPU1QnLCB1cmwpO1xuICBpZiAodHlwZW9mIGRhdGEgPT09ICdmdW5jdGlvbicpIHtcbiAgICBmbiA9IGRhdGE7XG4gICAgZGF0YSA9IG51bGw7XG4gIH1cblxuICBpZiAoZGF0YSkgcmVxdWVzdF8uc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXF1ZXN0Xy5lbmQoZm4pO1xuICByZXR1cm4gcmVxdWVzdF87XG59O1xuXG4vKipcbiAqIFBVVCBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR8RnVuY3Rpb259IFtkYXRhXSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2ZuXVxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5wdXQgPSAodXJsLCBkYXRhLCBmbikgPT4ge1xuICBjb25zdCByZXF1ZXN0XyA9IHJlcXVlc3QoJ1BVVCcsIHVybCk7XG4gIGlmICh0eXBlb2YgZGF0YSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGZuID0gZGF0YTtcbiAgICBkYXRhID0gbnVsbDtcbiAgfVxuXG4gIGlmIChkYXRhKSByZXF1ZXN0Xy5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcXVlc3RfLmVuZChmbik7XG4gIHJldHVybiByZXF1ZXN0Xztcbn07XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBRUEsSUFBSUEsSUFBSjs7QUFDQSxJQUFJLE9BQU9DLE1BQVAsS0FBa0IsV0FBdEIsRUFBbUM7RUFDakM7RUFDQUQsSUFBSSxHQUFHQyxNQUFQO0FBQ0QsQ0FIRCxNQUdPLElBQUksT0FBT0MsSUFBUCxLQUFnQixXQUFwQixFQUFpQztFQUN0QztFQUNBQyxPQUFPLENBQUNDLElBQVIsQ0FDRSxxRUFERjtFQUdBSixJQUFJLFNBQUo7QUFDRCxDQU5NLE1BTUE7RUFDTDtFQUNBQSxJQUFJLEdBQUdFLElBQVA7QUFDRDs7QUFFRCxNQUFNRyxPQUFPLEdBQUdDLE9BQU8sQ0FBQyxtQkFBRCxDQUF2Qjs7QUFDQSxNQUFNQyxhQUFhLEdBQUdELE9BQU8sQ0FBQyxxQkFBRCxDQUE3Qjs7QUFDQSxNQUFNRSxFQUFFLEdBQUdGLE9BQU8sQ0FBQyxJQUFELENBQWxCOztBQUNBLE1BQU1HLFdBQVcsR0FBR0gsT0FBTyxDQUFDLGdCQUFELENBQTNCOztBQUNBLGlCQUFvQ0EsT0FBTyxDQUFDLFNBQUQsQ0FBM0M7QUFBQSxNQUFRSSxRQUFSLFlBQVFBLFFBQVI7QUFBQSxNQUFrQkMsS0FBbEIsWUFBa0JBLEtBQWxCO0FBQUEsTUFBeUJDLE1BQXpCLFlBQXlCQSxNQUF6Qjs7QUFDQSxNQUFNQyxZQUFZLEdBQUdQLE9BQU8sQ0FBQyxpQkFBRCxDQUE1Qjs7QUFDQSxNQUFNUSxLQUFLLEdBQUdSLE9BQU8sQ0FBQyxj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