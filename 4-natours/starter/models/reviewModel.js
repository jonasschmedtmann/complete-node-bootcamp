const mongoose = require('mongoose');
const Tour = require('./tourModel');
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

//Calc average rating for a tour and update it once a new review added or deleted
reviewSchema.statics.calcAvgRating = async function (tour) {
  const stats = await this.aggregate([
    {
      $match: { tour },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log(stats);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tour, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverge: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tour, {
      ratingsQuantity: 0,
      ratingsAverge: 0,
    });
  }
};

reviewSchema.index({ tour: 1, user: 1 }, { unique: true }); //Compound index to avoid review duplicates from the same user to the same tour

reviewSchema.post('save', async function () {
  this.constructor.calcAvgRating(this.tour);
});
reviewSchema.pre(/^findOneAnd/, async function (next) {
  //This middleware is triggered whenver a review changed or deleted
  this.targetReview = await this.findOne(); // store the changed review
  next();
});
reviewSchema.post(/^findOneAnd/, async function () {
  await this.targetReview.constructor.calcAvgRating(this.targetReview.tour);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
