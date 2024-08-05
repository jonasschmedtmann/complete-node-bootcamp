const fs = require('fs');


const readFILE = (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, 'utf-8', (err, data) => {
      if (err) reject('I could not find the file');
      resolve(data);
    });
  });
};

const Text = async () => {
  try {
    const data = await readFILE(`${__dirname}/ReadTheFile.txt`);
    console.log(`${data}`);
    
  } catch (err) {
    console.log(err);
  }
};
Text();
