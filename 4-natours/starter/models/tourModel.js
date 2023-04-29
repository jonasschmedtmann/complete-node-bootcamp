const mongoose = require('mongoose');
const slugify = require('slugify');

const validator = require('validator')

const tourScheme = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true,
    maxlength: [40, 'A tour must have less or equal than 40 characters'],
    minlength: [10, 'A tour must have grater than 10 characters'],
    // validate: [validator.isAlpha, 'Tour name must only contain characters']
  },
  slug: String,
  secretTour: {
    type: Boolean,
    default: false
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration']
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour have a group size'],
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have the difficulty'],
    trim: true,
    // String vaidators..
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Difficulty is either: easy , meddium, diificulty'
    }

  },
  ratingsAverage: {
    type: Number,
    default: 2.5,
    min: [1, 'Rating must have be above 1.0'],
    max: [5, 'Rating must have be below 5.0']
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function (val) {
        // It's not going to work in update.
        // this only points to current document..
        return val < this.price
      },
      message: 'The discount({ value }) must be lower than the price'
    }
  },
  summery: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'A tour must have price']
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image']
  },
  images: [String],
  createdAt: {
    type: Date,
    // It will immedialtly converted to the todat date format..
    default: Date().now,
    select: false
  },
  // Ex -> "2021-01-23" it will parese the date by mongo.
  startDates: [Date],
},
  // virtial propety are being added in to the database..
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

tourScheme.virtual('durationWeeks').get(function () {
  return Math.trunc(this.duration / 7);
})

// DOCUMENT MIDDILEWARE...

// pre() opration..
// p-1
tourScheme.pre('save', (next) => {
  console.log("This will exicute first");
  next();
})

// p-2
tourScheme.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true })
  next();
})

// post() - opration
tourScheme.post('save', (doc, next) => {
  console.log("This is the documet that is added to the DB");
  console.log(doc);
  next();
})


// QUERY MIDDILEWARE...--->

// this is for the filterd out the the scretTour and can not be accessed publically.
// /^find/ -> for the all the findOne , the queryStart with find.
tourScheme.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } })
  this.start = new Date();
  next();
})

tourScheme.post(/^find/, function (docs, next) {
  console.log(`The Query will took ${Date.now() - this.start} millisec.. `);
  console.log(docs);
  next();
})

// AGGREGATION MIDDILEWARE...
tourScheme.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match })
  console.log(this.pipeline());
  next();

})


// mongoose.model('Tour', tourScheme); ---> Tour is the model name.
const Tour = mongoose.model('Tour', tourScheme);

module.exports = Tour;
