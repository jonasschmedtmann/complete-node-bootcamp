const { error } = require('console');
const fs = require('fs');
const { resolve } = require('path');
const superagent = require('superagent');

const readFilePromise = (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (error, data) => {
      if (error) reject(`Cannot Read from the file 😒 ${error.message}`);
      resolve(data);
    });
  });
};

const appendFilePromise = (file, data) => {
  return new Promise((resolve, reject) => {
    fs.appendFile(file, data, (error) => {
      if (error) reject(`Cannot append data 😒 ${error.message}`);
      resolve('Data appended sucessfully to the file ✔️');
    });
  });
};

//Using Async & Await
const getAndSaveQoute = async () => {
  try {
    const data = await readFilePromise(`${__dirname}/dog.txt`);
    const response = await superagent.get(
      `https://api.quotable.io/${data}/random`
    );
    await appendFilePromise('quotes-data.txt', response.body[0].content + '\n');
  } catch (error) {
    console.log(error);
  }
};

getAndSaveQoute();

// //Chaining Promises
// readFilePromise(`${__dirname}/dog.txt`)
//   .then((data) => {
//     return superagent.get(`https://api.quotable.io/${data}/random`); // Returns the api response in a promise
//   })
//   .then((response) => {
//     return appendFilePromise(
//       'quotes-data.txt',
//       response.body[0].content + '\n'
//     ); // Returns the append file promise
//   })
//   .then(() => {
//     console.log('Random Quote Saved to the file');
//   })
//   .catch((error) => {
//     console.log(error);
//   });
