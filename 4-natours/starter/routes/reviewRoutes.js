const express = require('express');
const {
  getAllReviews,
  createReview,
  getReview,
  updateReview,
  deleteReview,
  setTourUserIds,
} = require('../controllers/reviewController');

const authController = require('../controllers/authController');

//Using merge parameters to use params in nested routes
const ReviewRouter = express.Router({ mergeParams: true });

ReviewRouter.use(authController.protect);
ReviewRouter.route('/')
  .get(getAllReviews)
  .post(authController.restrictTo('user'), setTourUserIds, createReview);
ReviewRouter.route('/:id')
  .get(getReview)
  .patch(authController.restrictTo('user', 'admin'), updateReview)
  .delete(authController.restrictTo('user', 'admin'), deleteReview);

module.exports = ReviewRouter;
