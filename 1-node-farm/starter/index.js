const fs = require('fs');
const { dirname } = require('path');
const http = require('http');
const url = require('url');
const slugify = require('slugify');
const replaceTemplate = require('./modules/replaceTemplate');

////////////////////////FILES/////////////////////////////

//Synchronous (waits for one result before executing next one) - Blocking
/*const txtIn = fs.readFileSync(__dirname + "/txt/input.txt", "utf-8");
console.log(txtIn);
const textOut = `This is what we know about the avocado: ${txtIn}\nCreated ${Date.now()}`;
fs.writeFileSync(__dirname + "/txt/output.txt", textOut);
console.log("File Written");*/

//Asynchronous - Non Blocking - (starts reading the file in the background and immediatly goes to the next function)
/*fs.readFile(__dirname + "/txt/sstart.txt", "utf-8", (err, data1) => {
    if(err) console.log('ERROR 💥');

  fs.readFile(__dirname + `/txt/${data1}.txt`, "utf-8", (err, data2) => {
    console.log(data2);
    fs.readFile(__dirname + `/txt/append.txt`, "utf-8", (err, data3) => {
      console.log(data3);

      fs.writeFile("txt/final.txt", `${data2}\n${data3}`, "utf-8", (err) => {
        console.log("Your file has been written! 🔅");
      });
    });
  });
});
console.log("Will read file!");
*/

//////////////////////////SERVER///////////////////////
//Top-level code (outside the callback functions) - Called only once when the code starts

const tempOverview = fs.readFileSync(
  __dirname + '/templates/template-overview.html',
  'utf-8'
);
const tempCard = fs.readFileSync(
  __dirname + '/templates/template-card.html',
  'utf-8'
);
const tempProduct = fs.readFileSync(
  __dirname + '/templates/template-product.html',
  'utf-8'
);

const data = fs.readFileSync(__dirname + '/dev-data/data.json', 'utf-8');
const dataObj = JSON.parse(data);

//Slug can take an id and add the name of the product in the URL
const slugs = dataObj.map(el => slugify(el.productName, { lower: true }));
console.log(slugs);

const server = http.createServer((req, res) => {
  //console.log(req.url); // http://127.0.0.1:8000/overview?id=12&abc=567 req.url=/overview?id=12&abc=567
  const { query, pathname } = url.parse(req.url, true);

  //Overview Page
  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, { 'Content-type': 'text/html' });

    const cardsHtml = dataObj.map(el => replaceTemplate(tempCard, el)).join('');
    const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);

    res.end(output);

    //Product Page
  } else if (pathname === '/product') {
    res.writeHead(200, { 'Content-type': 'text/html' });
    const product = dataObj[query.id];
    const output = replaceTemplate(tempProduct, product);
    res.end(output);

    //API
  } else if (pathname === '/api') {
    res.writeHead(200, { 'Content-type': 'application/json' });
    res.end(data);

    //Not Found
  } else {
    res.writeHead(404, {
      'Content-type': 'text/html',
      'my-own-header': 'hello-world',
    }); //appears in the network tab
    //Response headers must be always set up before sending the response
    //They provide you more information about response (eg: location or server providing it)
    res.end('<h1>Page not found!</h1>');
  }
});

server.listen(8000, '127.0.0.1', () => {
  console.log('Listening to requests on port 8000');
});

//Routing - implementing different actions for different URL (eg: localhost:8000/products)
//We can use Express dependency to do it

/////////////////////DEPENDENCIES - NPM /////////////////////////
//When starting a project always install dependencies first
//1st - npm init | creates a package.json file with basic informations and versions you can accept
//2nd - npm install (nameModule) |install regular dependencies of the program being executed
//3rd - npm install (nameModule) --save -dev |install developement dependencies used only when in dev environment. Not needed to make the program run
//Node_modules folder created are dependencies of the modules we installed
//No need to share node_modules folder because you can easily set up on another environment with npm i
//package-lock.json - contains exactly what packages are installed
//npm install | package.json and package-lock.json need to be shared so other user can reconstruct the exact same modules

//Global dependencies - npm install (nameModule) --global | modules that you can use in every project
//To get a global dependency already installed, in the json file in the scripts you can do one. eg: "start": "nodemon index.js"
//To see global dependency list | npm list -g
//Check for outdated packages | npm outdated
//Update packages | npm update (nameModule)
//Deleting packages | npm uninstall (nameModule)

///////////Modules versions and Updating
//^1.18.11
//^ default means we accept patch in minor releases
//~ only accepts patch releases
//* all versions
// 1 - major version (huge new release that can have breaking changes)
// 18 - minor version (introduces new small features - are backward compatible)
// 11 - patch version (only to fix bugs)
