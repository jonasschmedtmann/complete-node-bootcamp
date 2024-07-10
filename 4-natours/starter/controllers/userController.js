//Users Routes Handlers
const AppError = require('../utils/AppError');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const HandleFactory = require('./handleFactory');

exports.getAllUsers = HandleFactory.getAll(User);
exports.getUser = HandleFactory.getOne(User);
exports.updateUser = HandleFactory.updateOne(User);
exports.deleteUser = HandleFactory.deleteOne(User);
exports.createUser = HandleFactory.createOne(User);

const filterObj = (obj, ...allowedFields) => {
  const filteredObj = {};

  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) filteredObj[el] = obj[el];
  });
  return filteredObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'Password Can not be changed using this route!, use /updatePassword instead',
        400,
      ),
    );
  }
  const filteredBody = filterObj(req.body, 'email', 'name');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(
    req.user.id,
    { active: false },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
