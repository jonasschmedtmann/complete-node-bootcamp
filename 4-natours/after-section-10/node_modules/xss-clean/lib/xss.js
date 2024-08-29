'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.clean = clean;

var _xssFilters = require('xss-filters');

function clean() {
  var data = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

  var isObject = false;
  if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object') {
    data = JSON.stringify(data);
    isObject = true;
  }

  data = (0, _xssFilters.inHTMLData)(data).trim();
  if (isObject) data = JSON.parse(data);

  return data;
}
//# sourceMappingURL=xss.js.map