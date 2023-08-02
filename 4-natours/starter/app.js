const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

const app = express();
const version = 'v1';
// Middlewares
app.use(morgan('dev'));
app.use(express.json());

app.use((req, res, next) => {
  console.log('Hello from the middleware 🤐');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

// Route handlers
// Tours handler
const getAllTours = (req, res) => {
  console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    results: tours.length,
    requestedAt: req.requestTime,
    data: { tours },
  });
};

const getTour = (req, res) => {
  const id = parseInt(req.params.id);
  const tour = tours.find((el) => el.id === id);
  const ids = [];
  for (let i = 0; i < tours.length; i++) {
    ids.push(tours[i].id);
  }

  maxIndex = Math.max(...ids);
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: `Invalid ID. Requested ${id} max ID: ${ids[maxIndex]}`,
    });
  }

  res.status(200).json({
    status: 'success',
    data: { tour },
  });
};

const createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
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

const updateTour = (req, res) => {
  if (parseInt(req.params.id) > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: `Invalid ID`,
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>',
    },
  });
};

const deleteTour = (req, res) => {
  if (parseInt(req.params.id) > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: `Invalid ID`,
    });
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
};

// Users handler
const getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

const getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};
// Routes
app.route(`/api/${version}/tours`).get(getAllTours).post(createTour);

app
  .route(`/api/${version}/tours/:id`)
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

app.route(`/api/${version}/users`).get(getAllUsers).post(createUser);

app
  .route(`api/${version}/users/:id`)
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

// Start server
const port = 3000;
app.listen(port, () => {
  console.log(`App runing on port ${port}...`);
});

// Old code
// app.get('/', (req, res) => {
//   res
//     .status(200)
//     .json({ message: 'Hello from the server side!', app: 'Natours' });
// });

// app.post('/', (req, res) => {
//   res.send('You can post to this endpoint...');
// });

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);
