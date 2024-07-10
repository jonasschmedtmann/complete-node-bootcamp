const express = require('express');
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
} = require('../controllers/tourController');
const authController = require('../controllers/authController');
const ReviewRouter = require('../routes/reviewRoutes');

const tourRouter = express.Router();

//Whenever this nested route appears use the review router
tourRouter.use('/:tourId/reviews', ReviewRouter);

tourRouter.route('/top-5-cheap').get(aliasTopTours, getAllTours);
tourRouter.route('/tour-stats').get(getTourStats);
tourRouter.route('/monthly-plan/:year').get(getMonthlyPlan);

// tourRouter.param('id', checkId);
tourRouter.route('/').get(authController.protect, getAllTours).post(createTour);

tourRouter.route('/:id').get(getTour).patch(updateTour).delete(
  authController.protect,
  // authController.restrictTo('admin', 'lead-guide'),
  deleteTour,
);

module.exports = tourRouter;
