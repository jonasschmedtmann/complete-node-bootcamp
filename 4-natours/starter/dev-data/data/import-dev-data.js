const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');

dotenv.config({ path: 'config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// * REMEMBER  * .connect(process.env.DATABASE_LOCAL, {...}) to connect to the local server env
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log('Connection succesfull Hurray!!!'));

// Read JSON file
const tour = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

// Import Data
const importData = async () => {
  try {
    await Tour.create(tour);
    console.log('data  loaded 🚀');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

// Delete Data

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('data  deleted 💥');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
