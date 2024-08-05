const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');
const router = express.Router();

router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewController.getOverview,
);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);

router.get('/login', viewController.getloginForm);
router.get('/signup', authController.isLoggedIn, viewController.getsignupForm);
router.get('/me', authController.protect, viewController.getAccount);
router.get('/my-tours', authController.protect, viewController.getMyTours)

router.post(
  '/submit-user-data',
  authController.protect,
  viewController.updateUserData,
);

module.exports = router;
