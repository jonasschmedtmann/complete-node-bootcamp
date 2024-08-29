const express = require('express');
const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
} = require('../controllers/userController');

const authController = require('../controllers/authController');

const userRouter = express.Router();

userRouter.route('/signup').post(authController.signup);
userRouter.route('/login').post(authController.login);
userRouter.route('/forgotPassword').post(authController.forgotPassword);
userRouter.route('/resetPassword/:token').patch(authController.resetPassword);

userRouter.use(authController.protect); //Each of the following will use protect
userRouter.get('/me', getMe, getUser);
userRouter.route('/updatePassword').patch(authController.updatePassword);
userRouter.route('/updateMe').patch(updateMe);
userRouter.route('/deleteMe').delete(deleteMe);

userRouter.use(authController.restrictTo('admin')); //Each of the following will use restrict to

userRouter.route('/').get(getAllUsers).post(createUser);

userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = userRouter;
