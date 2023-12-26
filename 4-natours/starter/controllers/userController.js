//const express = require('express');
const User = require('../models/userModel');

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({
      status: 'success',
      //statuCode: 200,
      data: { users },
    });
  } catch (err) {
    next(err);
  }
};
exports.createUsers = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', messgae: 'This route is not yet defined!' });
};
exports.getUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', messgae: 'This route is not yet defined!' });
};
exports.updateUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', messgae: 'This route is not yet defined!' });
};
exports.deleteUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', messgae: 'This route is not yet defined!' });
};
