// Tours Routes Handlers
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const HandleFactory = require('./handleFactory');

exports.aliasTopTours = (req, _res, next) => {
  req.query.limit = '5';
  req.query.sort = -'-price';
  req.query.fields = 'name,price,summary,ratingsAverage';
  next();
};

exports.getAllTours = HandleFactory.getAll(Tour);
exports.getTour = HandleFactory.getOne(Tour, { path: 'reviews' });
exports.createTour = HandleFactory.createOne(Tour);
exports.updateTour = HandleFactory.updateOne(Tour);
exports.deleteTour = HandleFactory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverge: { $gte: 3.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 }, //Count objects -> +=1
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverge' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    //Sort takes from the above
    { $sort: { avgPrice: 1 } },
  ]);
  res.status(200).json({
    status: 'success',
    data: { stats },
  });
});
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    //unwind is used to split startDates array into objects
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-02-01`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numToursStart: { $sum: 1 },
        tours: { $push: '$name' }, //Push to create array field
      },
    },
    { $addFields: { month: '$_id' } }, //Add fileds based on the above
    { $project: { _id: 0 } }, //To drop a field
  ]);
  res.status(200).json({
    status: 'success',
    data: { plan },
  });
});
