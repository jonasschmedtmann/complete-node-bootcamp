const dotenv = require('dotenv');
const fs = require('fs');
const mongoose = require('mongoose');
const Tour = require('../../models/tourModel');

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

const devDataFilePath = `${__dirname}/tours.json`;
const tours = JSON.parse(fs.readFileSync(devDataFilePath, 'utf-8'));

const importData = async () => {
  try {
    await Tour.create(tours);
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
