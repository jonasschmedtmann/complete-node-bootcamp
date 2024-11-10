//Review Routes Handlers
const Review = require('../models/reviewModel');
const HandleFactory = require('./handleFactory');

exports.getAllReviews = HandleFactory.getAll(Review);
exports.getReview = HandleFactory.getOne(Review);
exports.createReview = HandleFactory.createOne(Review);
exports.updateReview = HandleFactory.updateOne(Review);
exports.deleteReview = HandleFactory.deleteOne(Review);

exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
