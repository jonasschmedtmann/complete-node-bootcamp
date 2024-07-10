const express = require('express');
const {
  getAllReviews,
  createReview,
} = require('../controllers/reviewController');

const authController = require('../controllers/authController');

//Using merge parameters to use params in nested routes
const ReviewRouter = express.Router({ mergeParams: true });

ReviewRouter.route('/')
  .get(getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    createReview,
  );

module.exports = ReviewRouter;
