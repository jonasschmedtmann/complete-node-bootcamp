const dotenv = require('dotenv');
const fs = require('fs');
const mongoose = require('mongoose');
const Tour = require('./../../models/tourModel');
const Review = require('./../../models/reviewModel');
const User = require('./../../models/userModel');

dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to DB'));

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'),
);

const importData = async () => {
  try {
    await Tour.create(tours);
    await Review.create(reviews);
    await User.create(users, { validateBeforeSave: false });
    console.log('Data Imported Successfully');
  } catch (error) {
    console.log('Error Importing data: ' + error);
  } finally {
    process.exit();
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data Deleted Successfully');
  } catch (error) {
    console.log('Error Deleting data: ' + error);
  } finally {
    process.exit();
  }
};

const option = process.argv[2];
switch (option) {
  case '--import':
    importData();
    break;

  case '--delete':
    deleteData();
    break;

  case '--help':
    console.log(
      'Options:\n --import => import testing dev data\n --delete => Deleting all data from db ',
    );
    process.exit();

  default:
    console.log('Invalid option!\ntype --help for options');
    process.exit();
}
