const AppError = require('../utils/appError')

//  handling the incoming the errors..

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);
}

const sendErrorDev = function (err, res) {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    err: err,
    stac: err.stack
  })
}
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};


const sendErrorProd = function (err, res) {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    })
  } else {
    console.log('Error: 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Somthing went wrong!'
    })
  }
}

//////////////////////////////////////////////
// HANDLE ERROR OF USERS..

const handleJWTError = err => {
  console.log("Why are you guy!");
  return new AppError('Invalid token, please log in again!', 401)
}

const handleJWTExpired = err => new AppError('Your token has expired! please log in again!', 401)


module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error'

  if (process.env.NODE_ENV === 'development') {
    //Do the dev error
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {

    let error = { ...err };
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error === 'validationError')
      error = handleValidationErrorDB(error)
    if (error.name === 'JsonWebTokenError') error = handleJWTError()
    if (error.name === 'TokenExpiredError') error = handleJWTExpired()

    // Do the prodcution error.
    sendErrorProd(error, res)
  }
}