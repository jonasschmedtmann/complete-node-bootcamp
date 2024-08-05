"use strict";

var mongoose = require('mongoose');

var bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a Tour!']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a user!']
  },
  price: {
    type: Number,
    require: [true, 'Booking must have a price']
  },
  createdAt: {
    type: Date,
    "default": Date.now()
  },
  paid: {
    type: Boolean,
    "default": true
  }
});
bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name'
  });
  next();
});
var Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;