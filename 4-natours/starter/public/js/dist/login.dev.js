"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.logout = exports.login = exports.signup = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _alert = require("./alert");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/* eslint-disable */
var signup = function signup(name, email, password, passwordConfirm) {
  var res;
  return regeneratorRuntime.async(function signup$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;

          if (!(password !== passwordConfirm)) {
            _context.next = 4;
            break;
          }

          (0, _alert.showAlert)('error', 'Passwords do not match');
          return _context.abrupt("return");

        case 4:
          _context.next = 6;
          return regeneratorRuntime.awrap((0, _axios["default"])({
            method: 'POST',
            url: '/api/v1/users/signup',
            data: {
              name: name,
              email: email,
              password: password,
              passwordConfirm: passwordConfirm
            }
          }));

        case 6:
          res = _context.sent;

          if (res.data.status === 'success') {
            (0, _alert.showAlert)('success', 'Account created successfully');
            window.setTimeout(function () {
              location.assign('/'); // Redirect after a successful account created
            }, 1500);
          }

          _context.next = 13;
          break;

        case 10:
          _context.prev = 10;
          _context.t0 = _context["catch"](0);
          (0, _alert.showAlert)('error', _context.t0.response.data.message);

        case 13:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 10]]);
};

exports.signup = signup;

var login = function login(email, password) {
  var res;
  return regeneratorRuntime.async(function login$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap((0, _axios["default"])({
            method: 'POST',
            url: '/api/v1/users/login',
            data: {
              email: email,
              password: password
            }
          }));

        case 3:
          res = _context2.sent;

          if (res.data.status === 'success') {
            (0, _alert.showAlert)('success', 'Logged in successfully');
            window.setTimeout(function () {
              location.assign('/'); // Redirect after a successful login
            }, 1500);
          }

          _context2.next = 10;
          break;

        case 7:
          _context2.prev = 7;
          _context2.t0 = _context2["catch"](0);
          (0, _alert.showAlert)('error', _context2.t0.response.data.message);

        case 10:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 7]]);
};

exports.login = login;

var logout = function logout() {
  var res;
  return regeneratorRuntime.async(function logout$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return regeneratorRuntime.awrap((0, _axios["default"])({
            method: 'GET',
            url: '/api/v1/users/logout'
          }));

        case 3:
          res = _context3.sent;
          if (res.data.status = 'success') location.reload(true);
          _context3.next = 10;
          break;

        case 7:
          _context3.prev = 7;
          _context3.t0 = _context3["catch"](0);
          (0, _alert.showAlert)('error', 'Error logging out! Try again');

        case 10:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 7]]);
};

exports.logout = logout;