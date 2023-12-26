const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
    //unique: true,
    trim: true,
    //minLength: [10, 'Must be greater than or equal to 10'],
    //maxLength: [40, 'Must be greater than or equal to 40'],
  },
  email: {
    type: String,
    required: [true, 'A user must have at least one email address'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please enter a valid email address'],
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'A user must have a password'],
    minLength: [8, 'Password should be at least 8 chars long'],
    select: false,
    // omitUndefined: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (el) {
        return el === this.password; //abc===abc
      },
      message: 'Password do not match, try again!!!',
      // omitUndefined: false,
    },
  },
  passwordChangedAt: Date,
  photo: String,
  createdAt: {
    type: Date,
    default: Date.now,
    select: false,
  },
  passwordResetToken: {
    type: String,
    //omitUndefined: false,
  },

  passwordResetExpiry: {
    type: Date,
    //omitUndefined: false,
  },

  //_id: { type: String },
});
userSchema.pre('save', async function (next) {
  // only run this if the password was modified
  if (!this.isModified('password')) return next();
  //Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  // Delete password confirm field
  this.passwordConfirm = undefined;
  next();
});

//Compare the passwords to ensure they match
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  } //false means password not changed

  return false;
};
//CreateRestToken using Crypto and hash and save in db
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  //hash the token using sha256 al
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpiry = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

// update passwordChangedAt field when only password is changed

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
//console.log(mongoose.model());
const User = mongoose.model('user', userSchema);
module.exports = User;
