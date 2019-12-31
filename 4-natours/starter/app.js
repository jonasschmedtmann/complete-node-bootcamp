const express = require('express');
const morgan = require('morgan');
const app = express();

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// 1) Middlewears
app.use(morgan('dev'));

app.use(express.json());

// The use() method is to use any || all middlewears
app.use((req, res, next) => {
  console.log('Hello from the middlewear ✋');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//  3) ROUTES
app.use('/api/v1/tours', tourRouter);

app.use('/api/v1/users', userRouter);

// 4) START THE SERVER
module.exports = app;
