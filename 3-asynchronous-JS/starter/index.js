const fs = require('fs');
const superagent = require('superagent');

// readFilePro() will read files and will return a resolved or rejected  promise
const readFilePro = file => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) reject('Could not fine that file ☹️');
      resolve(data);
    });
  });
};

// writeFilePro() will write files and will return a resolved or rejected  promise
const writeFilePro = (file, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, err => {
      if (err) reject('could not write file');
      resolve('Succsess');
    });
  });
};

// First you need to call async function i.e getDogPic
const getDogPic = async () => {
  try {
    // Next you must assign await to a variable i.e data
    // in this case we calling the readFilePro() function

    // 1. Check data from the file
    const data = await readFilePro(`${__dirname}/dog.txt`);
    console.log(data);

    // 2. GET data from the api
    const res = await superagent.get(
      `https://dog.ceo/api/breed/${data}/images/random`
    );
    console.log(res.body.message);

    // 3. Write the response to a text file i.e dog-img.txt
    await writeFilePro('dog-img.txt', res.body.message);
    console.log('Random dog image saved to file');
  } catch (err) {
    console.log(err.message);

    throw err;
  }
  return '2: READY 😀';
};

(async () => {
  try {
    const res = await getDogPic();
    console.log(res);
    console.log('Step 1 will get dog pics');
    console.log('Step 3 done pics');
  } catch (err) {
    console.log('ERROR ❌');
  }
})();

/**
console.log('Step 1 will get dog pics');

// REMEMBER to use .then() to access the data from the getDogPic() function
getDogPic()
  .then(x => {
    console.log(x);
    console.log('Step 3 done pics');
  })
  .catch(err => {
    console.log('ERROR ❌');
  });
*/
/*
Write your comment here
readFilePro(`${__dirname}/dog.txt`)
.then(data => {
    console.log(`Breed: ${data}`);
    return superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
  })
  .then(res => {
    console.log(res.body.message);
    return writeFilePro('dog-img.txt', res.body.message);
  })
  .then(() => {
    console.log('Random dog image saved to file');
  })
  .catch(err => {
    console.error(err.message);
  });
  
  */
