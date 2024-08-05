"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var AppError = require('../utils/appError');

var handleCastErrorDB = function handleCastErrorDB(err) {
  var message = "Invalid ".concat(err.path, ": ").concat(err.value, ".");
  return new AppError(message, 400);
};

var handleDuplicateFieldsDB = function handleDuplicateFieldsDB(err) {
  var value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);
  var message = "Duplicate field value: ".concat(value, ". Please use another value!");
  return new AppError(message, 400);
};

var handleValidationErrorDB = function handleValidationErrorDB(err) {
  var errors = Object.values(err.errors).map(function (el) {
    return el.message;
  });
  var message = "Invalid input data. ".concat(errors.join('. '));
  return new AppError(message, 400);
};

var handleJWTError = function handleJWTError() {
  return new AppError('Invalid token. Please log in again!', 401);
};

var handleJWTExpiredError = function handleJWTExpiredError() {
  return new AppError('Your token has expired! Please log in again.', 401);
};

var sendErrorDev = function sendErrorDev(err, req, res) {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } // B) RENDERED WEBSITE


  console.error('ERROR 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message
  });
};

var sendErrorProd = function sendErrorProd(err, req, res) {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // A) Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } // B) Programming or other unknown error: don't leak error details
    // 1) Log error


    console.error('ERROR 💥', err); // 2) Send generic message

    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  } // B) RENDERED WEBSITE
  // A) Operational, trusted error: send message to client


  if (err.isOperational) {
    console.log(err);
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    });
  } // B) Programming or other unknown error: don't leak error details
  // 1) Log error


  console.error('ERROR 💥', err); // 2) Send generic message

  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.'
  });
};

module.exports = function (err, req, res, next) {
  // console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    var error = _objectSpread({}, err);

    error.message = err.message;
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorProd(error, req, res);
  }
};