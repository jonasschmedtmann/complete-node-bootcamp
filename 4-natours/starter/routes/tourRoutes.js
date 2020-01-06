const express = require('express');
const tourController = require('../contollers/tourController');

// Tours Routes
const router = express.Router();

// router.param('id', tourController.checkID);

router
  .route('/top-5-cheap')
  .get(tourController.aliasToTours, tourController.getAllTours);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
