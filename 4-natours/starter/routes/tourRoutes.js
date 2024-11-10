const express = require('express');
const { getAllTours, createTours, getTours, updateTours, deleteTours, alias, getTourStats, getMonthlyPlan } = require('../controllers/toursController')

const { protect, restrictTo } = require('../controllers/authController')

const router = express.Router();
// router.param('id', checkID)


router
  .route('/mothly-plan/:year')
  .get(getMonthlyPlan)

router
  .route('/tour-states')
  .get(getTourStats)
router
  .route('/top-5-cheap')
  .get(alias, getAllTours)

router
  .route('/')
  .get(protect, getAllTours)
  .post(createTours)


// This a specific middle-ware..
/*
app.use((req, res, next) => {
  console.log("This excute after the route and get..");
  next();
})
*/

router
  .route('/:id')
  .get(getTours)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTours)
// .patch(updateTours)

module.exports = router;