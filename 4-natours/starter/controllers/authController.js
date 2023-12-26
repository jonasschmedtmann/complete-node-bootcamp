//const { default: isEmail } = require('validator/lib/isEmail');
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
//const { body, validationResult } = require('express-validator');
const User = require('../models/userModel');
const ApiError = require('../utils/apiError');
const sendEmail = require('../utils/email');

//exports.validateSchema = async(req, res, next) => {
//body('email').isEmail().withMessage('Please enter a valid email');
//let req=this.req, res=this.re, next;
////body('email').isEmail().withMessage('Please enter a valid email');

//const errors = validationResult(req);

//if (!errors.isEmpty()) {
// console.log(errors.array());
// return res.status(404).json({
// status: 'fail',
// message: 'errors',
//});
//}
//next();
//body('email').isEmail().withMessage('Please enter a valid email');
//
//};

//create JWT token
const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  //send cookie
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    //secure: true,
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;

  res.status(statusCode).json({ status: 'success', token, data: { user } });
};

exports.signup = async (req, res, next) => {
  try {
    // handle validation error from the middleware using express-valdiator
    //const errors = validationResult(req);

    //if (!errors.isEmpty()) {
    //next((errors.array()[0].msg, 422));
    //}
    const newUser = await User.create(req.body);
    console.log(newUser._id);
    createToken(newUser, 201, res);
  } catch (err) {
    next(err);
    console.error(err.message);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    //1. check if email and password exists
    if (!email || !password) {
      return next(new ApiError('please provide email and password', 400));
    }

    //2. check if email and password exists and correct
    const user = await User.findOne({ email }).select('+password');
    console.log(user);
    //const correct = await user.correctPassword(password, user.password);
    if (!user || !(await user.correctPassword(password, user.password)))
      return next(new ApiError('Incorrect email or password', 401));
    // 3. if everything ok, send the token
    createToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};
exports.protectRoutes = async (req, res, next) => {
  try {
    //1. Getting token and check if it exists
    //console.log(req.headers);
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token)
      return next(
        new ApiError('Invalid login attempt, please try again..', 401)
      );
    //2 Verify Token
    //promisify the token which is another way to handle promises
    const verifyToken = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    );
    //console.log(verifyToken);
    //3 check if the user still exists could be id or email here we are using ID as token is generated using id
    const currentUser = await User.findById(verifyToken.id);
    if (!currentUser) {
      return next(new ApiError('User does not exist', 401));
    }

    //4 check if user changed password after the token was issued
    if (currentUser.changePasswordAfter(verifyToken.iat)) {
      return next(
        new ApiError('User recently updated password, please try again', 401)
      );
    }
    //Grant Access to the protected route
    req.user = currentUser;
    console.log(req.users);
    next();
  } catch (err) {
    next(err);
  }
};

//Handle Authorisation based on roles. roles are passed as array in the middleware in tours.
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles ['admi', 'lead-guide'] are passed. role='user' should fail
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

// forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    //1. Identify User based on email provided
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new ApiError('User not found', 404));
    }
    //2. Generate a reset token
    const resetToken = user.createPasswordResetToken();
    //****important to not validate fields when saving reset token */

    await user.save({ validateBeforeSave: false });
    //3. send email to the user's email
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )} /api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Sumbit a patch request with your new password and passwordConfirm to ${resetUrl}.\n 
    If you did not forget your password, please ignore this email`;
    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token is valid for 10 mins',
        message,
      });
      res.status(200).json({
        status: 'success',
        message: 'your token is sent to the email',
      });
    } catch (err) {
      console.log(err);
      user.passwordResetToken = undefined;
      user.passwordResetExpiry = undefined;
      await user.save({ validateBeforeSave: false });
      return next(new ApiError('there was something internl error', 500));
    }
  } catch (err) {
    next(err);
  }
};
// handle reset password request
exports.resetPassword = async (req, res, next) => {
  try {
    // 1. Get user based token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
    //find the user based on token and the expriry date.
    console.log({ hashedToken });
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpiry: { $gt: Date.now() },
    });
    //2. If token is not expired and the user is valid, set new password
    if (!user) {
      return next(new ApiError('Invalid Token or expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    await user.save();
    //3 Update changedPasswordAt property for the user
    //4 Log the user in and send JWT
    createToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};
// Update User's password
exports.updatePassword = async (req, res, next) => {
  try {
    //values passed from the protectRoutes middlware
    const oldUser = req.user;
    console.log(oldUser);
    const user = await User.findById({ _id: oldUser.id }).select('+password');
    //console.log(user);
    //const correct = await user.correctPassword(password, user.password);
    if (
      !user ||
      !(await user.correctPassword(req.body.password, user.password))
    )
      return next(new ApiError('Incorrect email or password', 401));

    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.confirmNewPassword;
    await user.save();
    // log user in and send JWT token
    createToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};
