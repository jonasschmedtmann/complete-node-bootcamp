//Review Routes Handlers
const Review = require('../models/reviewModel');
const HandleFactory = require('./handleFactory');

exports.getAllReviews = HandleFactory.getAll(Review);
exports.getReview = HandleFactory.getOne(Review);
exports.createReview = HandleFactory.createOne(Review);
exports.updateReview = HandleFactory.updateOne(Review);
exports.deleteReview = HandleFactory.deleteOne(Review);
