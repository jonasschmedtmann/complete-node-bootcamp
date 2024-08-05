"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.showAlert = exports.hideAlert = void 0;

/* eslint-disable */
var hideAlert = function hideAlert() {
  var el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

exports.hideAlert = hideAlert;

var showAlert = function showAlert(type, msg) {
  hideAlert();
  var markup = "<div class =\"alert alert--".concat(type, "\">").concat(msg, "</div>");
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, 5000);
};

exports.showAlert = showAlert;