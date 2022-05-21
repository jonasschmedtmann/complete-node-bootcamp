const express = require('express');
const userController= require('../controllers/userControllers');
const router = express.Router();

// app.use('/api/v1/users', router);

router.param('id', (req, res, next, val) => {
  console.log('id= ', val);
  next();
});

router.route('/').get(userController.getUsersName);
router.route('/:id').get(userController.getUserNameByID);

module.exports = router;
