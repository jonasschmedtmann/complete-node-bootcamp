const fs = require('fs');
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/APIFeatures')
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


exports.alias = (req, res, next) => {
  req.query.limit = '5'
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = "name,price,summery,ratingsAverage,difficulty"
  next();
}


exports.getAllTours = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sorting()
    .limitFields()
    .paginate()
  const tours = await features.query;

  res.status(200).json({
    status: "success",
    result: tours.length,
    data: {
      tours
    }
  })
})

exports.getTours = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id)

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));

  }
  console.log(tour);
  res.status(200).json({
    status: "success",
    data: {
      tour
    }
  })
})


exports.createTours = catchAsync(async (req, res) => {
  // By using the mongoess method.
  const newTour = await Tour.create(req.body)
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  })
})


exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});


exports.deleteTours = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id)
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));

  }

  res.status(204).json({
    status: "success",
    data: null
  })
})

exports.getTourStats = catchAsync(async (req, res, next) => {
  const states = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        avgRating: { $avg: '$ratingsAverage' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },

  ])

  res.status(200).json({
    status: "success",
    data: {
      states
    }
  })
})


exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    // Separte years from the array create a new document of each of the element.
    {
      $unwind: '$startDates'
    },
    // Filtering the year.
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    // search the tour in the monh
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    //Add a new fields..
    {
      $addFields: { month: '$_id' }
    },
    //  hide the _id
    {
      $project: {
        _id: 0
      }
    },
    //Sort the documents,,
    {
      $sort: { numTours: -1 }
    },
    // You can add limit..
    {
      $limit: 12
    }
  ])


  res.status(200).json({
    status: "success",
    data: {
      plan
    }
  })
})