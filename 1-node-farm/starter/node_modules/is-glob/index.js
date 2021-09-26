/*!
 * is-glob <https://github.com/jonschlinkert/is-glob>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

var isExtglob = require('is-extglob');
var chars = { '{': '}', '(': ')', '[': ']'};
var strictCheck = function (str) {
  if (str[0] === '!') {
    return true;
  }
  var index = 0;
  while (index < str.length) {
    if (str[index] === '*') {
      return true;
    }

    if (str[index + 1] === '?' && /[\].+)]/.test(str[index])) {
      return true;
    }

    if (str[index] === '[' && str[index + 1] !== ']') {
      var closeIndex = str.indexOf(']', index);
      if (closeIndex > index) {
        var slashIndex = str.indexOf('\\', index);
        if (slashIndex === -1 || slashIndex > closeIndex) {
          return true;
        }
      }
    }

    if (str[index] === '{' && str[index + 1] !== '}') {
      closeIndex = str.indexOf('}', index);
      if (closeIndex > index) {
        slashIndex = str.indexOf('\\', index);
        if (slashIndex === -1 || slashIndex > closeIndex) {
          return true;
        }
      }
    }

    if (str[index] === '(' && str[index + 1] === '?' && /[:!=]/.test(str[index + 2]) && str[index + 3] !== ')') {
      closeIndex = str.indexOf(')', index);
      if (closeIndex > index) {
        slashIndex = str.indexOf('\\', index);
        if (slashIndex === -1 || slashIndex > closeIndex) {
          return true;
        }
      }
    }

    if (str[index] === '(' && str[index + 1] !== '|') {
      var pipeIndex = str.indexOf('|', index);
      if (pipeIndex > index && str[pipeIndex + 1] !== ')') {
        closeIndex = str.indexOf(')', pipeIndex);
        if (closeIndex > pipeIndex) {
          slashIndex = str.indexOf('\\', pipeIndex);
          if (slashIndex === -1 || slashIndex > closeIndex) {
           return true;
          }
        }
      }
    }

    if (str[index] === '\\') {
      var open = str[index+1];
      index += 2;
      var close = chars[open];

      if (close) {
        var n = str.indexOf(close, index);
        if (n !== -1) {
          index = n + 1;
        }
      }

      if (str[index] === '!') {
        return true;
      }
    } else {
      index++;
    }
  }
  return false;
}

var relaxedCheck = function (str) {
  if (str[0] === '!') {
    return true;
  }
  var index = 0;
  while (index < str.length) {
    if (/[*?{}()[\]]/.test(str[index])) {
      return true;
    }

    if (str[index] === '\\') {
      var open = str[index+1];
      index += 2;
      var close = chars[open];

      if (close) {
        var n = str.indexOf(close, index);
        if (n !== -1) {
          index = n + 1;
        }
      }

      if (str[index] === '!') {
        return true;
      }
    } else {
      index++;
    }
  }
  return false;
}

module.exports = function isGlob(str, options) {
  if (typeof str !== 'string' || str === '') {
    return false;
  }

  if (isExtglob(str)) {
    return true;
  }

  var check = strictCheck;

  // optionally relax check
  if (options && options.strict === false) {
    check = relaxedCheck;
  }

  return check(str);
}
