const express = require('express');
const tourController = require('./../controllers/tourController');

const router = express.Router();

//Param Middleware
//router.param('id', tourController.checkID);

//
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);
const port = 3000;

module.exports = router;