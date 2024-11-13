const fs = require('fs');
const superagent = require('superagent');

const readFilePro = (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) reject('File not found 😬');
      resolve(data);
    });
  });
};

const writeFilePro = (file, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, (err) => {
      if (err) reject('Couldn not write a file 🤐');
      resolve('Success ✅');
    });
  });
};

const getDogPic = async () => {
  try {
    const data = await readFilePro(`${__dirname}/dog.txt`);
    console.log(`Breed: ${data}`);

    // const res = await superagent.get(
    //   `https://dog.ceo/api/breed/${data}/images/random`
    // );

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

    // console.log(res.body.message);
    // await writeFilePro('dog-image.txt', res.body.message);

    await writeFilePro('dog-image.txt', imgs.join('\n'));
    console.log('Random dog image file saved!');
  } catch (err) {
    console.log(err);
    throw err;
  }
  return '2: READY';
};

(async () => {
  try {
    console.log('1: Before');
    const res = await getDogPic();
    console.log(res);
    console.log('3: after');
  } catch (err) {
    console.log(`ERROR: ${err}`);
  }
})();

// console.log('1: will get dog pics');
// // const respon = getDogPic();
// getDogPic()
//   .then((respon) => {
//     console.log(respon);
//     console.log('3: Done get dog pics');
//   })
//   .catch((err) => {
//     console.log(`ERROR: ${err}`);
//   });

// readFilePro(`${__dirname}/dog.txt`)
//   .then((data) => {
//     console.log(`Breed: ${data}`);

//     return superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
//   })
//   .then((res) => {
//     console.log(res.body.message);

//     return writeFilePro('dog-image.txt', res.body.message);
//   })
//   .then(() => {
//     console.log('Random dog image file saved!');
//   })
//   .catch((err) => {
//     console.log(err);
//   });
// });

// with call back funcitons
// fs.readFile(`${__dirname}/dog.txt`, (err, data) => {
//   console.log(`Breed: ${data}`);

//   superagent
//     .get(`https://dog.ceo/api/breed/${data}/images/random`)
//     .end((err, res) => {
//       if (err) return console.log(err.message);
//       console.log(res.body.message);

//       fs.writeFile('dog-image.txt', res.body.message, (err) => {
//         console.log(`${data} dog image saved to file.`);
//       });
//     });
// });

// with promises
// fs.readFile(`${__dirname}/dog.txt`, (err, data) => {
//   console.log(`Breed: ${data}`);

//   superagent
//     .get(`https://dog.ceo/api/breed/${data}/images/random`)
//     .then((res) => {
//       console.log(res.body.message);

//       fs.writeFile('dog-image.txt', res.body.message, (err) => {
//         console.log(`${data} dog image saved to file.`);
//       });
//     })
//     .catch((err) => {
//       console.log(err.message);
//     });
// });
