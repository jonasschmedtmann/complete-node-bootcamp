
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel')


exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: "success",
    result: users.length,
    data: {
      users
    }
  })
})


exports.getUsers = (req, res) => {
  res.status(500).json({
    status: 'Fail',
    message: 'The route is not defined yet!!'
  })
}

exports.createUsers = (req, res) => {
  res.status(500).json({
    status: 'Fail',
    message: 'The route is not defined yet!!'
  })
}

exports.updateUsers = (req, res) => {
  res.status(500).json({
    status: 'Fail',
    message: 'The route is not defined yet!!'
  })
}

exports.deleteUsers = (req, res) => {
  res.status(500).json({
    status: 'Fail',
    message: 'The route is not defined yet!!'
  })
}