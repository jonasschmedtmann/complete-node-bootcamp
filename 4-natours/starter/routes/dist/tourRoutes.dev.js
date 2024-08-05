"use strict";

var express = require('express');

var tourController = require('../controllers/tourController');

var authController = require('../controllers/authController');

var reviewRouter = require('./reviewRoutes');

var router = express.Router(); // router.param('id', tourController.checkID );
// router.param('name', tourController.checkBody)

router.use('/:tourId/reviews', reviewRouter);
router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours);
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthlyPlan/:year').get(authController.protect, authController.restrictTo('admin', 'lead-guide', 'guides'), tourController.resizeTourImages, tourController.uploadTourImages, tourController.getMonthlyPlan);
router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin);
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);
router.route('/').get(tourController.getAllTours).post(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.createTour);
router.route('/:id').get(tourController.getTour).patch(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.updateTour)["delete"](authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour);
module.exports = router;