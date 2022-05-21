const fs = require('fs');

const tours = JSON.parse(fs.readFileSync('./dev-data/data/tours-simple.json'));

exports.checkID = (req, res, next, val) => {
  if (+val > tours.length) {
    res.status(202).json({
      message: 'Wrong ID',
    });
  }
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body || !req.body.name) {
    res.status(400).json({
      message: 'Body is empty',
    });
  }
  next();
};

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    tours,
  });
};

exports.getTourByID = (req, res) => {
  const id = +req.params.id;
  const tour = tours.filter((item) => item.id === id);

  if (tour.length === 0) {
    return res.status(404).json({
      status: '404',
    });
  }

  res.status(200).json({
    status: 'success',
    results: tours.length,
    tour,
  });
};

exports.updateToursByOne = (req, res) => {
  if (+req.params.id > tours.length) {
    return res.status(404).json({
      status: '404',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>',
    },
  });
  const updatedTours = tours.map((item) => {
    if (item.id === +req.params.id) {
      return { ...item, ...req.body };
    }
    return item;
  });
  fs.writeFile(
    './dev-data/data/tours-simple.json',
    JSON.stringify(updatedTours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: updatedTours,
        },
      });
    }
  );
};

exports.updateAllToursByOneUsingPost = (req, res) => {
  const newID = tours[tours.length - 1].id + 1;
  //const newTour = Object.assign({ id: newID }, req.body);
  const newTour = { ...req.body, id: newID };
  tours.push(newTour);
  fs.writeFile(
    './dev-data/data/tours-simple.json',
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};

exports.deleteTour = (req, res) => {
  if (+req.params.id > tours.length) {
    return res.status(404).json({
      status: '404',
    });
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
};
