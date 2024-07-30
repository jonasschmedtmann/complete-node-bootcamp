const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const ReviewRouter = require('../routes/reviewRoutes');

const tourRouter = express.Router();

//Whenever this nested route appears use the review router
tourRouter.use('/:tourId/reviews', ReviewRouter);

tourRouter.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours);
tourRouter.route('/tour-stats').get(tourController.getTourStats);
tourRouter.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

// tourRouter.param('id', checkId);
tourRouter.route('/').get(authController.protect, tourController.getAllTours).post(tourController.createTour);

tourRouter.route('/:id').get(tourController.getTour).patch(tourController.updateTour).delete(
  authController.protect,
  // authController.restrictTo('admin', 'lead-guide'),
  tourController.deleteTour,
);

module.exports = tourRouter;
