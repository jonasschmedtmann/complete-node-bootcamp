const express = require('express');
const tourController = require('../controllers/toursControllers');
const router = express.Router();
// app.use('/api/v1/tours', router);

router.param('id', tourController.checkID);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.checkBody, tourController.updateAllToursByOneUsingPost);

router
  .route('/:id')
  .get(tourController.getTourByID)
  .patch(tourController.updateToursByOne)
  .delete(tourController.deleteTour);

module.exports = router;
