const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      //Schema type object
      type: String,
      required: [true, 'A tour MUST have a name'], //Validator
      unique: true,
      trim: true,
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour MUST have a duration'], //Validator
    },

    maxGroupSize: {
      type: Number,
      required: [true, 'A tour MUST have a group size'], //Validator
    },

    difficulty: {
      type: String,
      required: [true, 'A tour MUST have a difficulty'], //Validator
      enum: {
        values: ['easy', 'medium', 'hard'],
        message: 'Difficulty is either easy, medium, or hard',
      },
    },

    ratingsAverge: {
      type: Number,
      default: 3.5,
      min: [1, 'Rating must between 1 an 5'],
      max: [5, 'Rating must between 1 an 5'],
    },

    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    price: {
      type: Number,
      required: [true, 'A tour MUST have a price'],
    },

    priceDiscount: {
      type: Number,
      //Custom Validator
      //We can use Validator npm pkg instead
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount {VALUE} must be less than actual price',
      },
    },

    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour MUST have a summary'],
    },

    description: {
      type: String,
      trim: true,
    },

    imageCover: {
      type: String,
      required: [true, 'A tour MUST have a cover Image'],
    },

    images: [String],

    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, //To be execluded from response
    },

    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    // startLocation: {
    //   //GeoJSON
    //   type: {
    //     type: String,
    //     default: 'Point',
    //     enum: ['Point'],
    //   },
    //   coordinates: [Number],
    //   address: String,
    //   description: String,
    // },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: String,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    //Enable Virtual Properties
    toJson: { virtual: true },
    toObject: { virtual: true },
  },
);

tourSchema.virtual('durationInWeeks').get(function () {
  return this.duration / 7;
});

// Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

//DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name);
  next();
});

//QUERY MIDDLEWARE: runs before .save() and .create()
tourSchema.pre(/^find/, function (next) {
  //Populate: Use reference to fill giudes data on select
  this.populate({ path: 'guides', select: '-__v -passwordChangedAt' });
  next();
});

//Middleware to map each guide id to a guide object
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

//AGGREGATION MIDDLEWARE: runs before aggregate
tourSchema.pre('aggregate', function (next) {
  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
