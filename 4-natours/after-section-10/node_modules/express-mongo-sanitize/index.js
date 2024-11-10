'use strict';

var TEST_REGEX = /^\$|\./,
    REPLACE_REGEX = /^\$|\./g;

function isPlainObject(obj) {
  return typeof obj === 'object' && obj !== null;
}

function withEach(target, cb) {
  var act = function(obj) {
    if(Array.isArray(obj)) {
      obj.forEach(act);

    } else if(isPlainObject(obj)) {
      Object.keys(obj).forEach(function(key) {
        var val = obj[key];
        var resp = cb(obj, val, key);
        if(resp.shouldRecurse) {
          act(obj[resp.key || key]);
        }
      });
    }
  };

  act(target);
}

function has(target) {
  var hasProhibited = false;
  withEach(target, function(obj, val, key) {
    if(TEST_REGEX.test(key)) {
      hasProhibited = true;
      return { shouldRecurse: false };
    } else {
      return { shouldRecurse: true };
    }
  });

  return hasProhibited;
}

function sanitize(target, options) {
  options = options || {};

  var replaceWith = null;
  if(!(TEST_REGEX.test(options.replaceWith))) {
    replaceWith = options.replaceWith;
  }

  withEach(target, function(obj, val, key) {
    var shouldRecurse = true;

    if(TEST_REGEX.test(key)) {
      delete obj[key];
      if(replaceWith) {
        key = key.replace(REPLACE_REGEX, replaceWith);
        obj[key] = val;
      } else {
        shouldRecurse = false;
      }
    }

    return {
      shouldRecurse: shouldRecurse,
      key: key
    };
  });

  return target;
}

function middleware(options) {
  return function(req, res, next) {
    ['body', 'params', 'query'].forEach(function(k) {
      if(req[k]) {
        req[k] = sanitize(req[k], options);
      }
    });
    next();
  };
}

module.exports = middleware;
module.exports.sanitize = sanitize;
module.exports.has = has;
