// const fs = require('fs');
const Tour = require('../modules/tourModel');

exports.aliasTopTour = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,-price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};
// Tours handler
exports.createTour = async (req, res) => {
  try {
    // const newTour = new Tour({})
    // newTour.save()

    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getAllTours = async (req, res) => {
  try {
    // build query
    const queryObj = { ...req.query };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];

    excludeFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Tour.find(JSON.parse(queryStr));

    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    if (req.query.fields) {
      const fieldsSelected = req.query.fields.split(',').join(' ');
      query = query.select(fieldsSelected);
    } else {
      query = query.select('-__v');
    }

    // pagenation
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) {
        throw new Error('Page does not exists');
      }
    }
    // execute query
    const tours = await query;

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: { tours },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
  // { difficulty: 'easy', duration: { $gte: 5} }
  // const tours = await Tour.find()
  //   .where('duration')
  //   .equals(5)
  //   .where('difficulty')
  //   .equals('easy');
};

exports.getTour = async (req, res) => {
  try {
    // Old middle ware call for fs ID
    // const id = parseInt(req.params.id, 10);
    // const tour = tours.find((el) => el.id === id);
    const tour = await Tour.findById(req.params.id);
    // Tour.findOne({ _id: req.params.id });
    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour: updatedTour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

// Old Middle ware functinos before mongoose
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
// );

// const getLastID = () => {
//   const ids = [];
//   for (let i = 0; i < tours.length; i++) {
//     ids.push(tours[i].id);
//   }
//   const maxIndex = Math.max(...ids);
//   return ids[maxIndex];
// };

// exports.checkID = (req, res, next, val) => {
//   if (parseInt(req.params.id, 10) > getLastID()) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID',
//       description: `Requested ID: ${parseInt(
//         req.params.id,
//         10,
//       )} - max ID is ${getLastID()}`,
//     });
//   }
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'No name or price sent',
//     });
//   }
//   next();
// };

// exports.createTour = (req, res) => {
//   const newId = getLastID() + 1;
//   const newTour = Object.assign({ id: newId }, req.body);

//   tours.push(newTour);
//   fs.writeFile(
//     `${__dirname}/dev-data/data/tours-simple.json`,
//     JSON.stringify(tours),
//     (err) => {
//       res.status(201).json({
//         status: 'success',
//         data: {
//           tour: newTour,
//         },
//       });
//     },
//   );
// };
