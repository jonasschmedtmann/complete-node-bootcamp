const express = require('express');
const tourController = require('./../controllers/tourController');
const router = express.Router();

// router.param('id', tourController.checkID );
// router.param('name', tourController.checkBody)

router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthlyPlan/:year').get(tourController.getMonthlyPlan);
router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.CreateTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.UpdateTour)
  .delete(tourController.DeleteTour);

module.exports = router;
