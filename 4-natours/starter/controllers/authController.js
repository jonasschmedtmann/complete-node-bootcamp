/* eslint-disable no-unused-expressions */
// THIS IS FOR THE CREATING A USER...
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const { promisify } = require('util')
const sendEmail = require('../utils/email')

const signToken = id => jwt.sign({ id }, process.env.JWT_SECERT, { expiresIn: process.env.JWT_EXPIRES_IN });

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  })
  const token = signToken(newUser._id)

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  })
});


exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) CHECK IS THE MAIL AND PASSWORD EXIST..
  if (!email || !password) {
    return next(new AppError('Please provide email & password', 400))
  }

  // CHECK IF THE USER EXISTS AND PASSWORD EXIST OR NOT..
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // IF EVEYTHING IS FINE THEN SEND THE TOKEN TO USER...

  const token = signToken(user._id)
  res.status(200).json({
    status: 'Success',
    token
  })
})

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there..
  // eslint-disable-next-line no-shadow
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }
  console.log(token);

  if (!token) {
    return next(new AppError('You are not logged in!, Please logged in to get the access', 401))
  }

  // 2) varificatin of the token..
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECERT)

  // 3) check is user still exists..
  const freshUser = await User.findById(decode.id);
  if (!freshUser) {
    return next(new AppError('The user belonging to this token does not exist!', 401))
  }

  // 4) checks is user changed password after the token was issued..

  if (freshUser.changePasswordAfter(decode.id)) {
    return next(new Error('User recently changed password: Please log in again.', 401))
  }

  // GRANT ACCESS TO PROTECTED ROUTE..
  req.user = freshUser;

  next();
})

exports.restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('You don not have permission to perform this action!!', 403))
  }

  next();
}

// REST ADD FORGET SEETING OF THE PASSWORDS..

exports.forgotPassword = catchAsync(async (req, res, next) => {

  // GET USER BASED ON POSTED EMAIL..
  const user = await User.findOne({ email: req.body.email })
  if (!user) {
    return next(new AppError('There is no user with this email address!!', 404))
  }

  // GENERATING THE RANDOM TOKEN.....
  const resetToken = user.createPasswordReset();

  await user.save({ validateBeforeSave: false })


  // SENDING THE EMAIL..
  const restURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`


  const message = `Forgot your password? Sumbit a PATCH  request with your new password and passwordConfirm to: ${restURL}.\nIf you didn't forget you password, please ignore this email`

  try {
    const data = await sendEmail({
      email: user.email,
      subject: 'Your password reset (valid for 10 min)',
      message
    })
    console.log(data);
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email'
    })
  } catch (err) {
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save({ validateBeforeSave: false })

    return next(new AppError('There was an error sending the email, Try again later!', 500))
  }
})


