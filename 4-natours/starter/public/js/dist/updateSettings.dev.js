"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateSettings = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _alert = require("./alert");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/* eslint-disable */
var updateSettings = function updateSettings(data, type) {
  var url, res;
  return regeneratorRuntime.async(function updateSettings$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          url = type === 'password' ? '/api/v1/users/updateMyPassword' : '/api/v1/users/updateMe';
          _context.next = 4;
          return regeneratorRuntime.awrap((0, _axios["default"])({
            method: 'PATCH',
            url: url,
            data: data
          }));

        case 4:
          res = _context.sent;

          if (res.data.status === 'success') {
            (0, _alert.showAlert)('success', "".concat(type.toUpperCase(), " successfully updated "));
          }

          _context.next = 11;
          break;

        case 8:
          _context.prev = 8;
          _context.t0 = _context["catch"](0);
          (0, _alert.showAlert)('error', _context.t0.response.data.message);

        case 11:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 8]]);
};

exports.updateSettings = updateSettings;