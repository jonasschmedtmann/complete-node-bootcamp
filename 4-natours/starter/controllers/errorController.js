// const e = require("express");
const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.s`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {

  //const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value:. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationError = err => {
  const errors = Object.values(err.errors).map(el => el.message)

  const message = `Invalid input data. ${erros.join('.')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  //Opperational, trused error: send message to client
  if (err.isOpperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  //Programming, unkown error: sdon't send
  } else {
    //log error
    console.error('ERROR 💥', err);

    //send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

//err
module.exports = (err, req, res, next) => {
  //console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err }; //destructuring the original error

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationError(error);

    sendErrorProd(error, res);
  }
};
