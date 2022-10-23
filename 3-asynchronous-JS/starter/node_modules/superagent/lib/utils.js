"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */
exports.type = string_ => string_.split(/ *; */).shift();
/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */


exports.params = value => {
  const object = {};

  var _iterator = _createForOfIteratorHelper(value.split(/ *; */)),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      const string_ = _step.value;
      const parts = string_.split(/ *= */);
      const key = parts.shift();
      const value = parts.shift();
      if (key && value) object[key] = value;
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return object;
};
/**
 * Parse Link header fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */


exports.parseLinks = value => {
  const object = {};

  var _iterator2 = _createForOfIteratorHelper(value.split(/ *, */)),
      _step2;

  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      const string_ = _step2.value;
      const parts = string_.split(/ *; */);
      const url = parts[0].slice(1, -1);
      const rel = parts[1].split(/ *= */)[1].slice(1, -1);
      object[rel] = url;
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }

  return object;
};
/**
 * Strip content related fields from `header`.
 *
 * @param {Object} header
 * @return {Object} header
 * @api private
 */


exports.cleanHeader = (header, changesOrigin) => {
  delete header['content-type'];
  delete header['content-length'];
  delete header['transfer-encoding'];
  delete header.host; // secuirty

  if (changesOrigin) {
    delete header.authorization;
    delete header.cookie;
  }

  return header;
};
/**
 * Check if `obj` is an object.
 *
 * @param {Object} object
 * @return {Boolean}
 * @api private
 */


exports.isObject = object => {
  return object !== null && typeof object === 'object';
};
/**
 * Object.hasOwn fallback/polyfill.
 *
 * @type {(object: object, property: string) => boolean} object
 * @api private
 */


exports.hasOwn = Object.hasOwn || function (object, property) {
  if (object == null) {
    throw new TypeError('Cannot convert undefined or null to object');
  }

  return Object.prototype.hasOwnProperty.call(new Object(object), property);
};

exports.mixin = (target, source) => {
  for (const key in source) {
    if (exports.hasOwn(source, key)) {
      target[key] = source[key];
    }
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJleHBvcnRzIiwidHlwZSIsInN0cmluZ18iLCJzcGxpdCIsInNoaWZ0IiwicGFyYW1zIiwidmFsdWUiLCJvYmplY3QiLCJwYXJ0cyIsImtleSIsInBhcnNlTGlua3MiLCJ1cmwiLCJzbGljZSIsInJlbCIsImNsZWFuSGVhZGVyIiwiaGVhZGVyIiwiY2hhbmdlc09yaWdpbiIsImhvc3QiLCJhdXRob3JpemF0aW9uIiwiY29va2llIiwiaXNPYmplY3QiLCJoYXNPd24iLCJPYmplY3QiLCJwcm9wZXJ0eSIsIlR5cGVFcnJvciIsInByb3RvdHlwZSIsImhhc093blByb3BlcnR5IiwiY2FsbCIsIm1peGluIiwidGFyZ2V0Iiwic291cmNlIl0sInNvdXJjZXMiOlsiLi4vc3JjL3V0aWxzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogUmV0dXJuIHRoZSBtaW1lIHR5cGUgZm9yIHRoZSBnaXZlbiBgc3RyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLnR5cGUgPSAoc3RyaW5nXykgPT4gc3RyaW5nXy5zcGxpdCgvICo7ICovKS5zaGlmdCgpO1xuXG4vKipcbiAqIFJldHVybiBoZWFkZXIgZmllbGQgcGFyYW1ldGVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLnBhcmFtcyA9ICh2YWx1ZSkgPT4ge1xuICBjb25zdCBvYmplY3QgPSB7fTtcbiAgZm9yIChjb25zdCBzdHJpbmdfIG9mIHZhbHVlLnNwbGl0KC8gKjsgKi8pKSB7XG4gICAgY29uc3QgcGFydHMgPSBzdHJpbmdfLnNwbGl0KC8gKj0gKi8pO1xuICAgIGNvbnN0IGtleSA9IHBhcnRzLnNoaWZ0KCk7XG4gICAgY29uc3QgdmFsdWUgPSBwYXJ0cy5zaGlmdCgpO1xuXG4gICAgaWYgKGtleSAmJiB2YWx1ZSkgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbiAgfVxuXG4gIHJldHVybiBvYmplY3Q7XG59O1xuXG4vKipcbiAqIFBhcnNlIExpbmsgaGVhZGVyIGZpZWxkcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLnBhcnNlTGlua3MgPSAodmFsdWUpID0+IHtcbiAgY29uc3Qgb2JqZWN0ID0ge307XG4gIGZvciAoY29uc3Qgc3RyaW5nXyBvZiB2YWx1ZS5zcGxpdCgvICosICovKSkge1xuICAgIGNvbnN0IHBhcnRzID0gc3RyaW5nXy5zcGxpdCgvICo7ICovKTtcbiAgICBjb25zdCB1cmwgPSBwYXJ0c1swXS5zbGljZSgxLCAtMSk7XG4gICAgY29uc3QgcmVsID0gcGFydHNbMV0uc3BsaXQoLyAqPSAqLylbMV0uc2xpY2UoMSwgLTEpO1xuICAgIG9iamVjdFtyZWxdID0gdXJsO1xuICB9XG5cbiAgcmV0dXJuIG9iamVjdDtcbn07XG5cbi8qKlxuICogU3RyaXAgY29udGVudCByZWxhdGVkIGZpZWxkcyBmcm9tIGBoZWFkZXJgLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBoZWFkZXJcbiAqIEByZXR1cm4ge09iamVjdH0gaGVhZGVyXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLmNsZWFuSGVhZGVyID0gKGhlYWRlciwgY2hhbmdlc09yaWdpbikgPT4ge1xuICBkZWxldGUgaGVhZGVyWydjb250ZW50LXR5cGUnXTtcbiAgZGVsZXRlIGhlYWRlclsnY29udGVudC1sZW5ndGgnXTtcbiAgZGVsZXRlIGhlYWRlclsndHJhbnNmZXItZW5jb2RpbmcnXTtcbiAgZGVsZXRlIGhlYWRlci5ob3N0O1xuICAvLyBzZWN1aXJ0eVxuICBpZiAoY2hhbmdlc09yaWdpbikge1xuICAgIGRlbGV0ZSBoZWFkZXIuYXV0aG9yaXphdGlvbjtcbiAgICBkZWxldGUgaGVhZGVyLmNvb2tpZTtcbiAgfVxuXG4gIHJldHVybiBoZWFkZXI7XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIGBvYmpgIGlzIGFuIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0XG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydHMuaXNPYmplY3QgPSAob2JqZWN0KSA9PiB7XG4gIHJldHVybiBvYmplY3QgIT09IG51bGwgJiYgdHlwZW9mIG9iamVjdCA9PT0gJ29iamVjdCc7XG59O1xuXG4vKipcbiAqIE9iamVjdC5oYXNPd24gZmFsbGJhY2svcG9seWZpbGwuXG4gKlxuICogQHR5cGUgeyhvYmplY3Q6IG9iamVjdCwgcHJvcGVydHk6IHN0cmluZykgPT4gYm9vbGVhbn0gb2JqZWN0XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0cy5oYXNPd24gPVxuICBPYmplY3QuaGFzT3duIHx8XG4gIGZ1bmN0aW9uIChvYmplY3QsIHByb3BlcnR5KSB7XG4gICAgaWYgKG9iamVjdCA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY29udmVydCB1bmRlZmluZWQgb3IgbnVsbCB0byBvYmplY3QnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG5ldyBPYmplY3Qob2JqZWN0KSwgcHJvcGVydHkpO1xuICB9O1xuXG5leHBvcnRzLm1peGluID0gKHRhcmdldCwgc291cmNlKSA9PiB7XG4gIGZvciAoY29uc3Qga2V5IGluIHNvdXJjZSkge1xuICAgIGlmIChleHBvcnRzLmhhc093bihzb3VyY2UsIGtleSkpIHtcbiAgICAgIHRhcmdldFtrZXldID0gc291cmNlW2tleV07XG4gICAgfVxuICB9XG59O1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUFBLE9BQU8sQ0FBQ0MsSUFBUixHQUFnQkMsT0FBRCxJQUFhQSxPQUFPLENB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