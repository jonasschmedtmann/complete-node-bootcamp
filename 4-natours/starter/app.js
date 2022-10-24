const fs = require('fs')
const express = require ("express");
const morgan = require('morgan')

const app = express();



//Middlewares
app.use(morgan('dev'));

app.use(express.json());

app.use((req, res, next) => {
    console.log('Hello from the middleware👋 ');
    next()
});

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next()
});

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
    );




//Rout handlers
const getAllTours = (req, res)=> {
    console.log(req.requestTime);
    res.status(200).json({
        status: 'success',
        rquestedAt: req.requestTime,
        results: tours.length,
        data: {
            tours
        }
    });
}
const getTour =  (req, res)=> {
    console.log(req.params);
    
    const id = req.params.id * 1;
    const tour = tours.find(el=> el.id === id)
    // if (id > tours.length){
    if (!tour){
        return res.status(404).json({
            status: 'fail',
            message: "Invalid ID"
        })
    }
    
    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    });
}

const createTour = (req, res)=> {
    const newId = tours[tours.length -1].id+1;
    const newTour = Object.assign({id: newId}, req.body);
    
    tours.push(newTour);
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, 
    JSON.stringify(tours), 
    err => {
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
    });
    }
)};

const updateTour = (req, res)=> {
    if (req.params.id * 1 > tours.length){
        return res.status(404).json({
            status: 'fail',
            message: "Invalid ID"
        })
    }
    res.status(200).json({
        status: 'success',
        data: {
            tour: '<Updated tour here...>'
        }
    })
}

const deleteTour = (req, res)=> {
    if (req.params.id * 1 > tours.length){
        return res.status(404).json({
            status: 'fail',
            message: "Invalid ID"
        })
    }
    res.status(204).json({
        status: 'success',
        data: {
            tour: 'null'
        }
    })
}


const getAllUsers = (req, res)=> {
    req.status(500).json({
        status: 'error',
        message: 'Route not yet defined'
    });
};
const getUser = (req, res)=> {
    req.status(500).json({
        status: 'error',
        message: 'Route not yet defined'
    });
};
const createUser = (req, res)=> {
    req.status(500).json({
        status: 'error',
        message: 'Route not yet defined'
    });
};
const updateUser = (req, res)=> {
    req.status(500).json({
        status: 'error',
        message: 'Route not yet defined'
    });
};
const deleteUser = (req, res)=> {
    req.status(500).json({
        status: 'error',
        message: 'Route not yet defined'
    });
};


//3) ROUTES
const tourRouter = express.Router();
const userRouter = express.Router();

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/user', userRouter);


tourRouter
.route('/')
.get(getAllTours)
.post(createTour)

tourRouter
.route('/:id')
.get(getTour)
.patch(updateTour)
.delete(deleteTour)
const port = 3000;


userRouter
.route('/')
.get(getAllUsers)
.post(createUser)

userRouter
.route('/:id')
.get(getUser)
.patch(updateUser)
.delete(deleteUser)


//Start server
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});