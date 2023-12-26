const express = require('express');
//const validator = require('express-validator');
const { check, body } = require('express-validator');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();
//create user
router.route('/signup').post(
  //[body('email').isEmail().withMessage('Please enter a valid email')],
  authController.signup
);
//login user
router.route('/login').post(
  //[body('email').isEmail().withMessage('Please enter a valid email')],
  authController.login
);
router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);
router
  .route('/updatePassword')
  .patch(authController.protectRoutes, authController.updatePassword);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUsers);
//alternate ways to handle routes below:

//app.route('/api/v1/users').get(getAllUsers).post(createUsers);
//or
//app.get('/api/v1/users', getAllUsers);
//or
//router.post('/api/v1/users', userController.createUsers);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);
module.exports = router;
