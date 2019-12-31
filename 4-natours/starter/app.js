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

// 2 ROUTE HANDLERS ||  CONTROLLERS
/*
Tours route handlers
*/

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

/*
Users route handlers
*/
const getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route has not yet been implimented'
  });
};

const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route has not yet been implimented'
  });
};

const getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route has not yet been implimented'
  });
};

const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route has not yet been implimented'
  });
};

const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route has not yet been implimented'
  });
};

// 3) ROUTES
/*
Tours routes
*/

const tourRouter = express.Router();
const userRouter = express.Router();

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

tourRouter
  .route('/')
  .get(getAllTours)
  .post(createTour);

tourRouter
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

/*
Users routes
*/
userRouter
  .route('/')
  .get(getAllUsers)
  .post(createUser);

userRouter
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

// 4) START THE SERVER
const port = 3000;
app.listen(port, () => {
  console.log(`App running on http://127.0.0.1:${port}...`);
});
