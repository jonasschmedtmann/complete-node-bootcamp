const fs = require('fs');
const { resolve } = require('path');
const superagent = require('superagent');

//Callback hell - makes code more difficult to read
//Promise - a future value that can be fullfilled or rejected
//with promises we will be able to chain them instead of nesting them
//Fullfilled promise (then method) - it has a result we want to use
//Rejected promise (catch method)- when there was an error. Only need one for all the promises

const readFilePro = (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) reject('I could not find that file'); //what we pass into reject function is the error available in the catch method
      resolve(data); //what we pass into the resolve function is the result that will be available in then handler
    });
  });
};

const writeFilePro = (file, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, (err) => {
      if (err) reject('I could not write file');
      resolve('sucess');
    });
  });
};
/*
readFilePro(`${__dirname}/dog.txt`)
  .then((res) => {
    console.log(`Breed: ${res}`)
    return superagent.get(`https://dog.ceo/api/breed/${res}/images/random`);
  })
  .then((res) => {
    console.log(res.body.message);
    return writeFilePro('dog-img.txt', res.body.message);
  })
  .then(() => {
    console.log('Random dog image saved to file');
  })
  .catch((err) => {
    console.log(err);
  });*/

///////ASYNC/AWAIT//////
const getDogPic = async () => {
  //This await will stop the code from running untill promise is resolved
  //If the promise is fullfilled the value will be set to data variable
  try {
    const data = await readFilePro(`${__dirname}/dog.txt`);
    console.log(`Breed: ${data}`);

    //When we want multiple promises but don't want them to wait on the other one
    //We don't await before and save them in variables
    //We can pass an array to Promises.all and then when we await it will run all promises at the same time
    const res1Pro = superagent.get(
      `https://dog.ceo/api/breed/${data}/images/random`
    );

    const res2Pro = superagent.get(
      `https://dog.ceo/api/breed/${data}/images/random`
    );

    const res3Pro = superagent.get(
      `https://dog.ceo/api/breed/${data}/images/random`
    );

    const all = await Promise.all([res1Pro, res2Pro, res3Pro]);

    const imgs = all.map((el) => el.body.message);

    console.log(imgs);

    await writeFilePro('dog-img.txt', imgs.join('\n'));
    console.log('Random dog image saved to file');
  } catch (err) {
    console.log(err);

    throw err;
  }
  return '2:Ready!';
};

//How to return values from Async/Await - this example mixes async/await with promises
/*console.log('1: Getting Image');
getDogPic()
  .then((x) => {
    console.log(x);
    console.log('3: Finihed!');
  })
  .catch((err) => {
    console.log('ERROR');
  });
*/

//Returning values with Async/Await only
(async () => {
  try {
    console.log('1: Getting Image');
    console.log(await getDogPic());
    console.log('3: Finihed!');
  } catch (err) {
    console.log('ERROR!');
  }
})();
