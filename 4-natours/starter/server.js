
const dotenv = require('dotenv')
const mongoose = require('mongoose')
dotenv.config({ path: './config.env' })
const app = require('./app');

// It will change the password to the required password..
const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWARD)

// This will return as a promise..
// This make a connecion between our node application to the mongoDb server .
mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then(() => console.log("DB connection successful"))

///////////////////////////////////////////////////
// Building schema and model...


// save() --> save the collection in the tour DB.
/*
testTour
  .save()
  .then(doc => console.log(doc))
  .catch(err => console.log("Error!!", err))
*/


const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Your server is listening to you sir.. ${PORT}...`);
});
