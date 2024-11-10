const mongoose = require('mongoose')
const validator = require('validator');
const bcrypt = require('bcryptjs');
const catchAsync = require('../utils/catchAsync');
const crypto = require('crypto');
// const catchAsync = require('../utils/catchAsync')

// name , email , photo , password ..
const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validator: [validator.isEmail, 'please provide a valid email']
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'please provide a password'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please confirm your password'],
    validate: {
      validator: function (el) {
        return el === this.password
      },
      message: 'Password are not same!'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  },
  passwordChangeAt: Date
})

// SECURE PASSWORD....

userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12)

  this.passwordConfirm = undefined
  next()
})

// COMAPRE USER ORIGINAL PASSWORD TO THE BCRYPT PASSWORD...

userSchema.methods.correctPassword = async function (candidatepassword, userPassword) {
  return await bcrypt.compare(candidatepassword, userPassword);
};

userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangeAt) {
    // IF THE PASSWORD HAS BEEN CHANGED...

    const changedTimestamp = parseInt(this.passwordChangeAt.getTime() / 1000, 10)

    return JWTTimestamp < changedTimestamp
  }

  // FALSE MENAS NOT CHANGED..
  return false;
}

// REST ADD FORGET SEETING OF THE PASSWORDS..

userSchema.methods.createPasswordReset = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');


  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken
}


const User = mongoose.model('User', userSchema)

module.exports = User;