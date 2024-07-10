const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review Can not be empty!'],
    },
    rating: {
      type: Number,
      default: 3.5,
      min: [1, 'Rating must between 1 an 5'],
      max: [5, 'Rating must between 1 an 5'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, //To be execluded from response
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour!'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user!'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.pre(/^find/, function (next) {
  //Populate: Use reference to fill tour & user data on select
  // this.populate({ path: 'tour', select: 'name price' }).
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
