const fs = require("fs");
const superganet = require("superagent");

fs.readFile(`${__dirname}/dog.txt`, (err, data) => {
  console.log(`Bread: ${data}`);
  superganet
    .get(`https://dog.ceo/api/breeds${data}/images/random`)
    .end((err, res) => {
      if (err) return console.log(err.message);
      console.log(res.body.message);

      fs.writeFile("dog-image.txt", res.body.message, (err) => {
        if (err) return console.log(err.message);
        console.log("Random dog image saved to file!");
      });
    });
});
