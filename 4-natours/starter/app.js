const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');
const hpp = require('hpp');
const morgan = require('morgan');
const express = require('express');
const { isUtf8 } = require('buffer');
const rateLimit = require('express-rate-limit');
//const dotenv = require('dotenv');
const tourRouter = require('./routes/tourRouter');
const ApiError = require('./utils/apiError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRouter');
const { urlToHttpOptions } = require('url');
const app = express();

app.use(helmet());
// log requests to console if env is dev
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//morgan function to log requests in a log file
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
);
// rate limit function
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

//console.log(html);
//#1 : Middleware
app.use('/api', limiter);
//body parser,reading data from  body  into req.body
app.use(express.json({ limit: '10kb' }));
// data sanitization against noSQL query injection
app.use(mongoSanitize());
//prevent paramaeter pollution
app.use(hpp());
//data sanitization against XSS protection
//app.use(xss());
app.use(morgan('combined', { stream: accessLogStream }));
//serving static files
app.use(express.static(`${__dirname}/public`));
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//#2:Route handlers

//#3:Routers

//users

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//handle all invalid routes
app.all('*', (req, res, next) => {
  //res
  //.status(404)
  //.json({
  //  status: 'fail',
  //  message: `Invalid request💩, can't find ${req.originalUrl} `,
  // });
  //const err = new Error(`cant find ${req.originalUrl} on this server`);
  //err.status = 'fail';
  //err.statusCode = 404;
  next(new ApiError(`cant find ${req.originalUrl} on this server`, 404));
});
app.use(globalErrorHandler);
//#4: Start server
module.exports = app;
