"use strict";

var Tour = require('../models/tourModel');

var User = require('../models/userModel');

var Booking = require('../models/bookingModel');

var catchAsync = require('../utils/catchAsync');

var AppError = require('../utils/appError');

exports.getOverview = catchAsync(function _callee(req, res, next) {
  var tours;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(Tour.find());

        case 2:
          tours = _context.sent;
          res.status(200).render('overview', {
            title: 'All Tours',
            tours: tours
          });

        case 4:
        case "end":
          return _context.stop();
      }
    }
  });
});
exports.getTour = catchAsync(function _callee2(req, res, next) {
  var tour;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(Tour.findOne({
            slug: req.params.slug
          }).populate({
            path: 'reviews',
            fields: 'review rating user'
          }));

        case 2:
          tour = _context2.sent;

          if (tour) {
            _context2.next = 5;
            break;
          }

          return _context2.abrupt("return", next(new AppError('There is no tour with that name', 404)));

        case 5:
          res.status(200).render('tour', {
            title: "".concat(tour.name, " Tour"),
            tour: tour
          });

        case 6:
        case "end":
          return _context2.stop();
      }
    }
  });
});

exports.getsignupForm = function (req, res) {
  res.status(200).render('signup', {
    title: 'Create your account'
  });
};

exports.getloginForm = function (req, res) {
  res.status(200).render('login', {
    title: 'Log into your account'
  });
};

exports.getAccount = function (req, res) {
  res.status(200).render('account', {
    title: 'Your account'
  });
};

exports.getMyTours = catchAsync(function _callee3(req, res, next) {
  var bookings, tourIDs, tours;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(Booking.find({
            user: req.user.id
          }));

        case 2:
          bookings = _context3.sent;
          tourIDs = bookings.map(function (el) {
            return el.tour;
          });
          _context3.next = 6;
          return regeneratorRuntime.awrap(Tour.find({
            _id: {
              $in: tourIDs
            }
          }));

        case 6:
          tours = _context3.sent;
          res.status(200).render('overview', {
            title: 'My Tours',
            tours: tours
          });

        case 8:
        case "end":
          return _context3.stop();
      }
    }
  });
});
exports.updateUserData = catchAsync(function _callee4(req, res, next) {
  var updatedUser;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return regeneratorRuntime.awrap(User.findByIdAndUpdate(req.user.id, {
            name: req.body.name,
            email: req.body.email
          }, {
            "new": true,
            runValidators: true
          }));

        case 2:
          updatedUser = _context4.sent;
          res.status(200).render('account', {
            title: 'Your account',
            user: updatedUser
          });

        case 4:
        case "end":
          return _context4.stop();
      }
    }
  });
});