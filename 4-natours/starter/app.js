const express = require('express');
const morgan = require('morgan');
// const rateLimit = require('express-rate-limiter');
const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const errorHandler = require('./controllers/ErrorController');
const AppError = require('./utils/AppError');
const { default: rateLimit } = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const app = express();

//Set Security Http Headers
app.use(helmet());

if (process.env.NODE_ENV == 'dev') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, Try again later',
});

app.use('/api', limiter);

//Middleware in order to parse incoming JSON Request & limit response greater than 10 KiloBytes
app.use(express.json({ limit: '10kb' }));

//To Prevent NoSQL Query Injection
app.use(mongoSanitize());

//Against XSS Attacks (malicious http requests)
app.use(xss());

//Prevent Parameter Pullution (Repeated request Parmeters: Get Only the last)
app.use(
  hpp({
    whitelist: ['duration', 'difficulty'], //Allow duplication for these fields
  }),
);

//Serving Static Files
app.use(express.static(`${__dirname}/public/`));

//Routes
const USERS_ROUTE = '/api/v1/users';

const TOURS_ROUTE = '/api/v1/tours';

const REVIEWS_ROUTE = '/api/v1/reviews';

app.use(USERS_ROUTE, userRouter);
app.use(TOURS_ROUTE, tourRouter);
app.use(REVIEWS_ROUTE, reviewRouter);

//Router for all unhandled routes
//Should be placed at the very bottom of the routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler Middleware
// app.use(errorHandler);

module.exports = app;
