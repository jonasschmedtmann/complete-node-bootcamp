const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

//const dbConnect = async function () {
//try {
const conDB = async function () {
  try {
    await mongoose
      //.connect(process.env.DATABASE_LOCAL, {
      .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        dbName: 'Natours-API',
      });
    //dbConnected ((con) => {
    console.log('Successfully! Connected to MongoDB');
    //console.log(dbConnected);
    //});
  } catch (err) {
    console.log(err);
  }
};
conDB();
//mongoose.connection();
//sconsole.log(process.env);

const port = process.env.port || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
