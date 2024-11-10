
// THIS IS FOR GENETATING NEW ERROR...
// if a invalid user input is there, then the it generating a new error and 
// trigger the isOpratonal error = true so that then I can manage it production side..
// That means it a client req failur or you can say invalid client req..


class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;