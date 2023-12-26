const express = require('express');
const { isUtf8 } = require('buffer');
const moment = require('moment');

const fs = require('fs');
const Tour = require('../models/tourModel');
const ApiError = require('../utils/apiError');
//const { error } = require('console');
const APIFeatures = require('../utils/apiFeatures');

exports.getAllTours = async (req, res) => {
  try {
    //BUILD QUERY
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const tours = await features.query;

    // EXECUTE QUERY

    //SEND RESPONSE
    res.status(200).json({
      status: 'success',
      dataLengths: tours.length,
      requestedDate: req.requestTime,

      data: { tours: tours },
    });
  } catch (err) {
    console.log(err.message);
    return res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.getTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    dataLengths: Tour.length,
    requestedDate: req.requestTime,
    data: { tours: Tour },
  });
};
//Grouping and Matching
exports.getStats = async (req, res, next) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: {
          ratingsAverage: {
            $gte: 4.5,
          },
        },
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxprice: { $max: '$price' },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
    ]);
    res.status(200).json({
      status: 'success',
      //dataLengths: Stats.length,
      requestedDate: req.requestTime,

      data: { stats },
    });
  } catch (err) {
    next(err);
  }
};

//Unwinding and Projecting
exports.getMonthlyPlan = async (req, res, next) => {
  try {
    const year = req.params.year * 1;

    //console.log(`old date; ${dateNew1} and new date : ${dateNew2}`);
    //console.log(typeof noTime);

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },

      {
        $group: {
          _id: { $month: `$startDates` },
          totalMonthTours: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: {
          month: '$_id',
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: {
          totalMonthTours: -1,
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      //dataLengths: plan.length,
      //requestedDate: req.requestTime,

      data: { plan },
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

//const catchAsync = (fn) => {
//return (req, res, next) => {
// fn(req, res, next).catch(next);
////};
//};

exports.getTourByID = async (req, res, next) => {
  console.log(req.params);
  try {
    const { id } = req.params;

    const tour = await Tour.find({ _id: id });
    console.log(tour);
    if (tour.length < 1) {
      return next(new ApiError('invalid tour ID', 404));
    }

    res.status(200).json({
      status: 'success',

      data: { tours: tour },
    });
    //Alternative method to handle error and pass to global error handler middlware
  } catch (err) {
    next(err);
  }
};

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
  });
};

exports.postTour = async (req, res, next) => {
  try {
    //console.log(req.body);
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'Tour created',
      data: { tours: newTour },
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteTour = async (req, res, next) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    if (!tour) {
      return next(new ApiError('No tour found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};
// import data and delete old data
const tours = JSON.parse(
  fs.readFileSync('./dev-data/data/tours-simple.json', 'utf-8')
);
//const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
//const reviews = JSON.parse(
//fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
//);

// IMPORT DATA INTO DB
/*exports.importData = async (req, res, next) => {
  try {
    await Tour.deleteMany();
    //await User.deleteMany();
    //await Review.deleteMany();
    console.log('Data successfully deleted!');

    console.log('importing data');
    //const delay = function () {
      console.log('importing');
    //};
    //setTimeout(delay, 3000);

    const createTour = await Tour.create(tours);
    //await User.create(users, { validateBeforeSave: false });
    //await Review.create(reviews);
    console.log('Data successfully loaded!');
    res.status(200).json({
      status: 'success',
      data: { tours: createTour },
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

// DELETE ALL DATA FROM DB
*/
