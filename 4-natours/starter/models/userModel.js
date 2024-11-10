const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcrypt');

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide an email'],
  },

  email: {
    type: String,
    unique: true,
    required: [true, 'Please provide an email'],
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },

  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
  },
  password: {
    type: String,
    required: true,
    minLength: 8,
    select: false,
    // validate:[validator.isStrongPassword, "Weak Password"]
  },

  passwordConfirm: {
    type: String,
    required: true,
    validate: {
      //We used normal function instead of arrow => to use this
      validator: function (el) {
        return el === this.password;
      },
      message: 'passwords do not match',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

//A query middleware to filter out inactive users
schema.pre(/^find/, async function (next) {
  this.find({ active: { $ne: false } });
  next();
});
schema.pre('save', async function (next) {
  //Run only when password changed
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined; //Remove it from DB
  next();
});
//Middleware to be executed once password changes
schema.pre('save', async function (next) {
  //Run only when password changed
  if (!this.isModified('password' || this.isNew)) return next();
  this.passwordChangedAt = Date.now() - 1;
  next();
});

//Instance method to be called on all docs of this collection

schema.methods.arePasswordsMatch = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

//If user changed his password after getting a token -> return false
schema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

schema.methods.createPasswordResetToken = function () {
  //Create reset token to be sent via email
  const resetToken = crypto.randomBytes(32).toString('hex');

  //update user  password reset token (stored in db)
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  console.log(`ForgotPassword-Before Hashing: ${resetToken}`);
  console.log(`ForgotPassword-After Hashing: ${this.passwordResetToken}`);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', schema);
module.exports = User;
