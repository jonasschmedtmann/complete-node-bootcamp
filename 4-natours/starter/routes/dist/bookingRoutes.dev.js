"use strict";

var express = require('express');

var bookingController = require('../controllers/bookingController');

var authController = require('../controllers/authController');

var router = express.Router();
router.use(authController.protect);
router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);
router.use(authController.restrictTo('admin', 'lead-guide'));
router.route('/').get(bookingController.getAllBookings).post(bookingController.createBooking);
router.route('/:id').get(bookingController.getBooking).patch(bookingController.updateBooking)["delete"](bookingController.deleteBooking);
module.exports = router;