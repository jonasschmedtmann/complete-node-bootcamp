//const app = require('../app');
//onst request = req.body
const validator = require('validator');

class UserCreate {
  constructor(req) {
    this.name = req.name;
    this.email = req.price;
    this.password = req.description;
    this.confirmPassword = req.confirmPassword;
  }
}

module.exports = UserCreate;
