
const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/UserRoutes');
const app = express();

// 1) Middlewares
if(process.env.NODE_ENV === 'development'){

  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`))

app.use((req, res, next) => {
  console.log('Hello from the middleware');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});






// Better way of routing / Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app