"use strict";

var User = require('../models/userModel');

var catchAsync = require('../utils/catchAsync');

var AppError = require('../utils/appError');

var factory = require('./handlerFactory');

var sharp = require('sharp');

var multer = require('multer'); // const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.minetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}. ${ext}`);
//   },
// });


var multerStorage = multer.memoryStorage();

var multerFilter = function multerFilter(req, file, cb) {
  if (file.minetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an Image! Please upload only images', 400), false);
  }
};

var upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});
exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = function (req, res, next) {
  if (!req.file) return next();
  req.file.filename = "user-".concat(req.user.id, "-").concat(Date.now(), ".jpeg");
  sharp(req.file.buffer).resize(500, 500).uatoFormat('jpeg').jpeg({
    quality: 90
  }).toFile("public/img/users/".concat(req.file.filename));
  next();
};

var filterObj = function filterObj(obj) {
  for (var _len = arguments.length, allowedFields = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    allowedFields[_key - 1] = arguments[_key];
  }

  var newObj = {};
  Object.keys(obj).forEach(function (el) {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = function (req, res, next) {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(function _callee(req, res, next) {
  var filteredBody, updatedUser;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          console.log(req.file); // 1) Create error if user POSTs password data

          if (!(req.body.password || req.body.passwordConfirm)) {
            _context.next = 3;
            break;
          }

          return _context.abrupt("return", next(new AppError('This route is not for password updates. Please use /updateMyPassword.', 400)));

        case 3:
          // 2) Filtered out unwanted fields names that are not allowed to be updated
          filteredBody = filterObj(req.body, 'name', 'email');
          if (req.file) filteredBody.photo = req.file.filename; // 3) Update user document

          _context.next = 7;
          return regeneratorRuntime.awrap(User.findByIdAndUpdate(req.user.id, filteredBody, {
            "new": true,
            runValidators: true
          }));

        case 7:
          updatedUser = _context.sent;
          res.status(200).json({
            status: 'success',
            data: {
              user: updatedUser
            }
          });

        case 9:
        case "end":
          return _context.stop();
      }
    }
  });
});
exports.deleteMe = catchAsync(function _callee2(req, res, next) {
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(User.findByIdAndUpdate(req.user.id, {
            active: false
          }));

        case 2:
          res.status(204).json({
            status: 'success',
            data: null
          });

        case 3:
        case "end":
          return _context2.stop();
      }
    }
  });
});
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);

exports.createUser = function (req, res) {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined! Please use /signup instead'
  });
};

exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);