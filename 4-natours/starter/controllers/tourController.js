// Tours Routes Handlers
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const HandleFactory = require('./handleFactory');
const AppError = require('./../utils/AppError');

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

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  if (!latlng) {
    next(new AppError('Please provide latitude and longitude', 400));
  }
  if (!unit) {
    unit = 'mi';
  }
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6387.1;
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

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

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  if (!latlng) {
    next(new AppError('Please provide latitude and longitude', 400));
  }
  if (!unit) {
    unit = 'mi';
  }
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      distances,
    },
  });
});
