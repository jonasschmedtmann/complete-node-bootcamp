"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var nodemailer = require('nodemailer');

var pug = require('pug');

var htmlToText = require('html-to-text');

module.exports =
/*#__PURE__*/
function () {
  function Email(user, url) {
    _classCallCheck(this, Email);

    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = "Favour<".concat(process.env.EMAIL_FROM, ">");
  }

  _createClass(Email, [{
    key: "newTransport",
    value: function newTransport() {
      if (process.env.NODE_ENV === 'production') {
        // sendbrevo
        return nodemailer.createTransport({
          services: 'Brevo',
          auth: {
            user: process.env.BREVO_USERNAME,
            pass: process.env.BREVO_PASSWORD
          }
        });
      }

      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    }
  }, {
    key: "send",
    value: function send(template, subject) {
      var html, mailoptions;
      return regeneratorRuntime.async(function send$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              html = pug.renderFile("".concat(__dirname, "/../../views/email/").concat(template, ".pug"), {
                firstName: this.firstName,
                url: this.url,
                subject: subject
              });
              mailoptions = {
                from: this.from,
                to: this.to,
                subject: subject,
                html: html,
                text: htmlToText.fromString(html)
              };
              _context.next = 4;
              return regeneratorRuntime.awrap(this.newTransport().sendMail(mailoptions));

            case 4:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "sendWelcome",
    value: function sendWelcome() {
      return regeneratorRuntime.async(function sendWelcome$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return regeneratorRuntime.awrap(this.send('welcome', 'welcome to the natours Family'));

            case 2:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "sendPasswordReset",
    value: function sendPasswordReset() {
      return regeneratorRuntime.async(function sendPasswordReset$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return regeneratorRuntime.awrap(this.send('passwordReset', 'Your password reset token (valid for only 10 minutes)'));

            case 2:
            case "end":
              return _context3.stop();
          }
        }
      }, null, this);
    }
  }]);

  return Email;
}();