const fs = require('fs');
const morgan = require('morgan');
const express = require('express');
const app = express();

// 1) Middlewears
app.use(morgan('dev'));
app.use(express.json());

// The use() method is to use a middlewear
app.use((req, res, next) => {
  console.log('Hello from the middlewear ✋');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

// 2 ROUTE HANDLERS
const getAllTours = (req, res) => {
  console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    requsetedAt: req.requestTime,
    results: tours.length,
    data: {
      tours
    }
  });
};
const getTour = (req, res) => {
  console.log(req.params);
  // Using * 1 ie req.params.id * 1 is a type converstion
  const id = req.params.id * 1;
  const tour = tours.find(el => el.id === id);

  // if (id > tours.length) {
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid ID'
    });
  }

  res.status(200).json({
    status: 'success',

    data: {
      tour
    }
  });
};

const createTour = (req, res) => {
  // console.log(req.body);
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    err => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour
        }
      });
    }
  );
};
const updateTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid ID'
    });
  }

  res.status(200).json({
    status: 'succsess',
    data: {
      tour: '<Updated tour here...>'
    }
  });
};

const deleteTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid ID'
    });
  }

  res.status(204).json({
    status: 'succsess',
    data: {
      tour: null
    }
  });
};

// *NOTE* : sign to create a variable param ie (:id || :anyName || :x)
// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

// 3) ROUTES
app
  .route('/api/v1/tours')
  .get(getAllTours)
  .post(createTour);

app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

// 4) START THE SERVER
const port = 3000;
app.listen(port, () => {
  console.log(`App running on http://127.0.0.1:${port}...`);
});
