"use strict";

var path = require('path');

var express = require('express');

var morgan = require('morgan');

var rateLimit = require('express-rate-limit');

var helmet = require('helmet');

var mongoSanitize = require('express-mongo-sanitize');

var xss = require('xss-clean');

var hpp = require('hpp');

var cookieParser = require('cookie-parser');

var compression = require('compression');

var cors = require('cors');

var AppError = require('./utils/appError');

var globalErrorHandler = require('./controllers/errorController');

var tourRouter = require('./routes/tourRoutes');

var userRouter = require('./routes/userRoutes');

var reviewRouter = require('./routes/reviewRoutes');

var bookingRouter = require('./routes/bookingRoutes');

var viewRouter = require('./routes/viewRoutes');

var app = express();
app.enable('trust proxy');
app.use(function (req, res, next) {
  res.setHeader('Content-Security-Policy', "default-src 'self'; connect-src 'self' ws://127.0.0.1:49785 https:;");
  next();
});
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views')); // 1) GLOBAL MIDDLEWARES
// Serving static files

app.use(express["static"](path.join(__dirname, 'public'))); // Implemrnt CORS

app.use(cors()); // Set security HTTP headers

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://js.stripe.com'],
      connectSrc: ["'self'", 'ws://127.0.0.1:49777', 'https:', 'https://api.stripe.com'],
      frameSrc: ["'self'", 'https://js.stripe.com'] // Add this line
      // Add other directives as needed

    }
  }
})); // Development logging

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} // Limit requests from same API


var limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter); // Body parser, reading data from body into req.body

app.use(express.json({
  limit: '10kb'
}));
app.use(express.urlencoded({
  extended: true,
  limit: '10kb'
}));
app.use(express.urlencoded({
  extended: true,
  limit: '10kb'
}));
app.use(cookieParser()); // Data sanitization against NoSQL query injection

app.use(mongoSanitize()); // Data sanitization against XSS

app.use(xss()); // Prevent parameter pollution

app.use(hpp({
  whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']
}));
app.use(compression()); // Test middleware

app.use(function (req, res, next) {
  req.requestTime = new Date().toISOString();
  next();
}); // 3) ROUTES

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
app.all('*', function (req, res, next) {
  next(new AppError("Can't find ".concat(req.originalUrl, " on this server!"), 404));
});
app.use(globalErrorHandler);
module.exports = app;