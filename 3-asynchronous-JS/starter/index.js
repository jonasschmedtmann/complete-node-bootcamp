const fs = require('fs');
const superagent = require('superagent');

const readFilePro = file => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) reject('Could not fine that file ☹️');
      resolve(data);
    });
  });
};

readFilePro(`${__dirname}/dog.txt`).then(data => {
  console.log(`Breed: ${data}`);

  // We are using superagent to get() the endpoint
  superagent
    .get(`https://dog.ceo/api/breed/${data}/images/random`)
    .then(res => {
      //   This will WRITE to the file
      fs.writeFile('dog-img.txt', res.body.message, err => {
        if (err) return console.error(err.message);
        console.log('Random dog image saved to file');
      });
    })
    .catch(err => {
      console.error(err.message);
    });
});
// // To READ the content of the file directory to the console in this case
// fs.readFile(`${__dirname}/dog.txt`, (err, data) => {});
