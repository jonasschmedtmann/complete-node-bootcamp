const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true,
    minLength: [10, 'Must be greater than or equal to 10'],
    maxLength: [40, 'Must be greater than or equal to 40'],
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size'],
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
  },
  ratingsQunatity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  summary: { type: String, trim: true },
  priceDiscount: {
    type: Number,

    validate: {
      validator: function (val) {
        //console.log(val);
        return val < this.price; //100<200
      },
      message: 'Discount price should be less than the price',
    },
  },

  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image'],
  },
  images: [String],

  startDates: [Date],
  secretTour: {
    type: Boolean,
    default: false,
  },
  //_id: { type: String },
});

//console.log(mongoose.model());
const Tour = mongoose.model('tour', tourSchema);
module.exports = Tour;
