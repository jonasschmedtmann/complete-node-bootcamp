
const express = require('express');
const { authController, protect, signup, login, forgotPassword, resetPassword, updatePassword } = require('../controllers/authController')
const { getAllUsers, createUsers, getUsers, updateUsers, deleteUsers } = require('../controllers/usersController')


const router = express.Router();

router
  .post('/signup', signup)
  .post('/login', login)

// VARIFICATION OF PASSWORDS..

router
  .post('/forgotPassword', forgotPassword)
  .patch('/resetPassword/:token', resetPassword)

router
  .patch('/updateMyPassword', protect, updatePassword)

// Users....
router
  .route('/')
  .get(getAllUsers)
  .post(createUsers)

// NO contribution is showing it is just for the showCase..

router
  .route('/:id')
  .get(getUsers)
  .patch(updateUsers)
  .delete(protect, deleteUsers)

module.exports = router;
