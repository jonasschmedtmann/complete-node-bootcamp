const express = require('express');
const authController = require('../controllers/authController');
//const app = require('../app');

const router = express.Router();
const tourController = require('../controllers/tourController');
//tourRouter.route('/').get(getAllTours);
//router.route('/').get(tourController.getAllTours);

//adding a custom middleware for sepecific routes
//router.param('id', tourController.checkID);
//router
// get request return by id param
router.route('/tour-stats').get(tourController.getStats);
router.route('/tour-plan/:year').get(tourController.getMonthlyPlan);
router
  .route('/:id')
  .get(authController.protectRoutes, tourController.getTourByID)
  .delete(
    authController.protectRoutes,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );
//router.route('/import-data').post(tourController.importData);

router
  .route('/')
  .get(authController.protectRoutes, tourController.getAllTours)
  .post(tourController.postTour);
//app.route('/api/v1/tours').get(getTours).post(postTour);
// same as app.get('/api/v1/tours', getTours);

module.exports = router;
