const crypto = require('crypto');
const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const sendEmail = require('../utils/email');

const jwt = require('jsonwebtoken');
const { getAllUsers } = require('./userController');

const getToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = getToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    // secure: true, //Sent only over https
    httpOnly: true, //Not to be modified
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    message: 'success',
    token,
    data: { user },
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role || 'user',
  });

  createSendToken(newUser._id, 200, res);

  res.status(200).json({
    message: 'success',
    token,
    data: { user: newUser },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('please provide email and passwords', 400));
  }

  const user = await User.findOne({
    email,
  }).select('+password');

  if (!user || !(await user.arePasswordsMatch(password, user.password))) {
    return next(new AppError('Invalid Email or Password', 401));
  }
  const token = getToken(user._id);

  res.status(200).json({
    message: 'success',
    token,
  });
});

//A middleware to check auth before requests
exports.protect = catchAsync(async (req, res, next) => {
  //Get token & Check if exists
  let token;
  const authorization = req.headers.authorization;
  if (authorization && authorization.startsWith('Bearer')) {
    token = authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('UnAuthorized, Please Login', 401));
  }
  //Token Verification
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //Check User Existence (Token exists, User not)
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(new AppError('User does not exist', 401));
  }
  //Check password Change after token generation
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password, please login again ', 401),
    );
  }

  req.user = freshUser;
  //Grant access to protected route
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const email = req.body.email;

  const user = await User.findOne({
    email: email,
  });

  if (!user) {
    return next(new AppError('Invalid Email (NO User Associated)', 404));
  }

  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password, Submit a PATCH request with new password and confirmPassword to ${resetUrl}`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Valid for 10 Mins',
      message,
    });

    res.status(200).json({
      status: 'Success',
      message: 'Password reset token sent to provided email',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        `There is an error when sending an email, try again: ${error}`,
        404,
      ),
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  console.log(`ResetPassword-Before Hashing: ${req.params.token}`);
  console.log(`ResetPassword-After Hashing: ${hashedToken}`);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  const token = getToken(user._id);

  res.status(200).json({
    message: 'success',
    token,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  console.log(req.user);
  const user = await User.findById(req.user.id).select('+password');

  if (!user.arePasswordsMatch(req.body.currentPassword, user.password)) {
    next(new AppError('current password incorrect', 401));
  }

  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPassword;
  await user.save();

  const token = getToken(user._id);

  res.status(200).json({
    message: 'success',
    token,
  });
});
