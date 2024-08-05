"use strict";

var mongoose = require('mongoose');

var dotenv = require('dotenv');

dotenv.config({
  path: './config.env'
});

var app = require('./app');

var DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then(function () {
  return console.log('DB connection successful!');
});
var port = process.env.PORT || 3000;
var server = app.listen(port, function () {
  console.log("App running on port ".concat(port, "..."));
});
process.on('unhandledRejection', function (err) {
  console.log(err.name, err.message);
  console.log('UNHANDLER REJECTION');
  server.close(function () {
    process.exit(1);
  });
});
process.on('SIGTERM', function () {
  console.log('SIGTERM RECEIVED. Shutting down gracefully ');
  server.close(function () {
    console.log('Process terminated');
  });
});