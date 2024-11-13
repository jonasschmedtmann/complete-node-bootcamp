"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
/**
 * Module dependencies.
 */

// eslint-disable-next-line node/no-deprecated-api
const _require = require('url'),
  parse = _require.parse;
const _require2 = require('cookiejar'),
  CookieJar = _require2.CookieJar;
const _require3 = require('cookiejar'),
  CookieAccessInfo = _require3.CookieAccessInfo;
const methods = require('methods');
const request = require('../..');
const AgentBase = require('../agent-base');

/**
 * Expose `Agent`.
 */

module.exports = Agent;

/**
 * Initialize a new `Agent`.
 *
 * @api public
 */

function Agent(options) {
  if (!(this instanceof Agent)) {
    return new Agent(options);
  }
  AgentBase.call(this);
  this.jar = new CookieJar();
  if (options) {
    if (options.ca) {
      this.ca(options.ca);
    }
    if (options.key) {
      this.key(options.key);
    }
    if (options.pfx) {
      this.pfx(options.pfx);
    }
    if (options.cert) {
      this.cert(options.cert);
    }
    if (options.rejectUnauthorized === false) {
      this.disableTLSCerts();
    }
  }
}
Agent.prototype = Object.create(AgentBase.prototype);

/**
 * Save the cookies in the given `res` to
 * the agent's cookie jar for persistence.
 *
 * @param {Response} res
 * @api private
 */

Agent.prototype._saveCookies = function (res) {
  const cookies = res.headers['set-cookie'];
  if (cookies) {
    var _res$request;
    const url = parse(((_res$request = res.request) === null || _res$request === void 0 ? void 0 : _res$request.url) || '');
    this.jar.setCookies(cookies, url.hostname, url.pathname);
  }
};

/**
 * Attach cookies when available to the given `req`.
 *
 * @param {Request} req
 * @api private
 */

Agent.prototype._attachCookies = function (request_) {
  const url = parse(request_.url);
  const access = new CookieAccessInfo(url.hostname, url.pathname, url.protocol === 'https:');
  const cookies = this.jar.getCookies(access).toValueString();
  request_.cookies = cookies;
};
var _iterator = _createForOfIteratorHelper(methods),
  _step;
try {
  for (_iterator.s(); !(_step = _iterator.n()).done;) {
    const name = _step.value;
    const method = name.toUpperCase();
    Agent.prototype[name] = function (url, fn) {
      const request_ = new request.Request(method, url);
      request_.on('response', this._saveCookies.bind(this));
      request_.on('redirect', this._saveCookies.bind(this));
      request_.on('redirect', this._attachCookies.bind(this, request_));
      this._setDefaults(request_);
      this._attachCookies(request_);
      if (fn) {
        request_.end(fn);
      }
      return request_;
    };
  }
} catch (err) {
  _iterator.e(err);
} finally {
  _iterator.f();
}
Agent.prototype.del = Agent.prototype.delete;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJyZXF1aXJlIiwicGFyc2UiLCJDb29raWVKYXIiLCJDb29raWVBY2Nlc3NJbmZvIiwibWV0aG9kcyIsInJlcXVlc3QiLCJBZ2VudEJhc2UiLCJtb2R1bGUiLCJleHBvcnRzIiwiQWdlbnQiLCJvcHRpb25zIiwiY2FsbCIsImphciIsImNhIiwia2V5IiwicGZ4IiwiY2VydCIsInJlamVjdFVuYXV0aG9yaXplZCIsImRpc2FibGVUTFNDZXJ0cyIsInByb3RvdHlwZSIsIk9iamVjdCIsImNyZWF0ZSIsIl9zYXZlQ29va2llcyIsInJlcyIsImNvb2tpZXMiLCJoZWFkZXJzIiwidXJsIiwic2V0Q29va2llcyIsImhvc3RuYW1lIiwicGF0aG5hbWUiLCJfYXR0YWNoQ29va2llcyIsInJlcXVlc3RfIiwiYWNjZXNzIiwicHJvdG9jb2wiLCJnZXRDb29raWVzIiwidG9WYWx1ZVN0cmluZyIsIm5hbWUiLCJtZXRob2QiLCJ0b1VwcGVyQ2FzZSIsImZuIiwiUmVxdWVzdCIsIm9uIiwiYmluZCIsIl9zZXREZWZhdWx0cyIsImVuZCIsImRlbCIsImRlbGV0ZSJdLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ub2RlL2FnZW50LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm9kZS9uby1kZXByZWNhdGVkLWFwaVxuY29uc3QgeyBwYXJzZSB9ID0gcmVxdWlyZSgndXJsJyk7XG5jb25zdCB7IENvb2tpZUphciB9ID0gcmVxdWlyZSgnY29va2llamFyJyk7XG5jb25zdCB7IENvb2tpZUFjY2Vzc0luZm8gfSA9IHJlcXVpcmUoJ2Nvb2tpZWphcicpO1xuY29uc3QgbWV0aG9kcyA9IHJlcXVpcmUoJ21ldGhvZHMnKTtcbmNvbnN0IHJlcXVlc3QgPSByZXF1aXJlKCcuLi8uLicpO1xuY29uc3QgQWdlbnRCYXNlID0gcmVxdWlyZSgnLi4vYWdlbnQtYmFzZScpO1xuXG4vKipcbiAqIEV4cG9zZSBgQWdlbnRgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gQWdlbnQ7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgQWdlbnRgLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gQWdlbnQob3B0aW9ucykge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQWdlbnQpKSB7XG4gICAgcmV0dXJuIG5ldyBBZ2VudChvcHRpb25zKTtcbiAgfVxuXG4gIEFnZW50QmFzZS5jYWxsKHRoaXMpO1xuICB0aGlzLmphciA9IG5ldyBDb29raWVKYXIoKTtcblxuICBpZiAob3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zLmNhKSB7XG4gICAgICB0aGlzLmNhKG9wdGlvbnMuY2EpO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zLmtleSkge1xuICAgICAgdGhpcy5rZXkob3B0aW9ucy5rZXkpO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zLnBmeCkge1xuICAgICAgdGhpcy5wZngob3B0aW9ucy5wZngpO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zLmNlcnQpIHtcbiAgICAgIHRoaXMuY2VydChvcHRpb25zLmNlcnQpO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zLnJlamVjdFVuYXV0aG9yaXplZCA9PT0gZmFsc2UpIHtcbiAgICAgIHRoaXMuZGlzYWJsZVRMU0NlcnRzKCk7XG4gICAgfVxuICB9XG59XG5cbkFnZW50LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQWdlbnRCYXNlLnByb3RvdHlwZSk7XG5cbi8qKlxuICogU2F2ZSB0aGUgY29va2llcyBpbiB0aGUgZ2l2ZW4gYHJlc2AgdG9cbiAqIHRoZSBhZ2VudCdzIGNvb2tpZSBqYXIgZm9yIHBlcnNpc3RlbmNlLlxuICpcbiAqIEBwYXJhbSB7UmVzcG9uc2V9IHJlc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuQWdlbnQucHJvdG90eXBlLl9zYXZlQ29va2llcyA9IGZ1bmN0aW9uIChyZXMpIHtcbiAgY29uc3QgY29va2llcyA9IHJlcy5oZWFkZXJzWydzZXQtY29va2llJ107XG4gIGlmIChjb29raWVzKSB7XG4gICAgY29uc3QgdXJsID0gcGFyc2UocmVzLnJlcXVlc3Q/LnVybCB8fCAnJylcbiAgICB0aGlzLmphci5zZXRDb29raWVzKGNvb2tpZXMsIHVybC5ob3N0bmFtZSwgdXJsLnBhdGhuYW1lKTtcbiAgfVxufTtcblxuLyoqXG4gKiBBdHRhY2ggY29va2llcyB3aGVuIGF2YWlsYWJsZSB0byB0aGUgZ2l2ZW4gYHJlcWAuXG4gKlxuICogQHBhcmFtIHtSZXF1ZXN0fSByZXFcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbkFnZW50LnByb3RvdHlwZS5fYXR0YWNoQ29va2llcyA9IGZ1bmN0aW9uIChyZXF1ZXN0Xykge1xuICBjb25zdCB1cmwgPSBwYXJzZShyZXF1ZXN0Xy51cmwpO1xuICBjb25zdCBhY2Nlc3MgPSBuZXcgQ29va2llQWNjZXNzSW5mbyhcbiAgICB1cmwuaG9zdG5hbWUsXG4gICAgdXJsLnBhdGhuYW1lLFxuICAgIHVybC5wcm90b2NvbCA9PT0gJ2h0dHBzOidcbiAgKTtcbiAgY29uc3QgY29va2llcyA9IHRoaXMuamFyLmdldENvb2tpZXMoYWNjZXNzKS50b1ZhbHVlU3RyaW5nKCk7XG4gIHJlcXVlc3RfLmNvb2tpZXMgPSBjb29raWVzO1xufTtcblxuZm9yIChjb25zdCBuYW1lIG9mIG1ldGhvZHMpIHtcbiAgY29uc3QgbWV0aG9kID0gbmFtZS50b1VwcGVyQ2FzZSgpO1xuICBBZ2VudC5wcm90b3R5cGVbbmFtZV0gPSBmdW5jdGlvbiAodXJsLCBmbikge1xuICAgIGNvbnN0IHJlcXVlc3RfID0gbmV3IHJlcXVlc3QuUmVxdWVzdChtZXRob2QsIHVybCk7XG5cbiAgICByZXF1ZXN0Xy5vbigncmVzcG9uc2UnLCB0aGlzLl9zYXZlQ29va2llcy5iaW5kKHRoaXMpKTtcbiAgICByZXF1ZXN0Xy5vbigncmVkaXJlY3QnLCB0aGlzLl9zYXZlQ29va2llcy5iaW5kKHRoaXMpKTtcbiAgICByZXF1ZXN0Xy5vbigncmVkaXJlY3QnLCB0aGlzLl9hdHRhY2hDb29raWVzLmJpbmQodGhpcywgcmVxdWVzdF8pKTtcbiAgICB0aGlzLl9zZXREZWZhdWx0cyhyZXF1ZXN0Xyk7XG4gICAgdGhpcy5fYXR0YWNoQ29va2llcyhyZXF1ZXN0Xyk7XG5cbiAgICBpZiAoZm4pIHtcbiAgICAgIHJlcXVlc3RfLmVuZChmbik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlcXVlc3RfO1xuICB9O1xufVxuXG5BZ2VudC5wcm90b3R5cGUuZGVsID0gQWdlbnQucHJvdG90eXBlLmRlbGV0ZTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxpQkFBa0JBLE9BQU8sQ0FBQyxLQUFLLENBQUM7RUFBeEJDLEtBQUssWUFBTEEsS0FBSztBQUNiLGtCQUFzQkQsT0FBTyxDQUFDLFdBQVcsQ0FBQztFQUFsQ0UsU0FBUyxhQUFUQSxTQUFTO0FBQ2pCLGtCQUE2QkYsT0FBTyxDQUFDLFdBQVcsQ0FBQztFQUF6Q0csZ0JBQWdCLGFBQWhCQSxnQkFBZ0I7QUFDeEIsTUFBTUMsT0FBTyxHQUFHSixPQUFPLENBQUMsU0FBUyxDQUFDO0FBQ2xDLE1BQU1LLE9BQU8sR0FBR0wsT0FBTyxDQUFDLE9BQU8sQ0FBQztBQUNoQyxNQUFNTSxTQUFTLEdBQUdOLE9BQU8sQ0FBQyxlQUFlLENBQUM7O0FBRTFDO0FBQ0E7QUFDQTs7QUFFQU8sTUFBTSxDQUFDQyxPQUFPLEdBQUdDLEtBQUs7O0FBRXRCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBU0EsS0FBSyxDQUFDQyxPQUFPLEVBQUU7RUFDdEIsSUFBSSxFQUFFLElBQUksWUFBWUQsS0FBSyxDQUFDLEVBQUU7SUFDNUIsT0FBTyxJQUFJQSxLQUFLLENBQUNDLE9BQU8sQ0FBQztFQUMzQjtFQUVBSixTQUFTLENBQUNLLElBQUksQ0FBQyxJQUFJLENBQUM7RUFDcEIsSUFBSSxDQUFDQyxHQUFHLEdBQUcsSUFBSVYsU0FBUyxFQUFFO0VBRTFCLElBQUlR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