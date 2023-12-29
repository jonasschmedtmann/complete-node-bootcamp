const fs = require('node:fs');
const http = require('http');
const url = require('url');

////////FILES
//Blocking Syncronous Way
// const textIn = fs.readFileSync('./1-node-farm/starter/txt/input.txt', 'utf-8');
// console.log(textIn);
// const textOut = `This is what we know about the avocado ${textIn}.\nCreated on ${Date.now()}`;

// fs.writeFileSync('./1-node-farm/starter/txt/output.txt', textOut);
// console.log('File written!');

//Non-blocking asynchronous way
// fs.readFile('./1-node-farm/starter/txt/start.txt', 'utf-8', (err, data1) => {
//   if (err) return console.log('ERROR!🥵')
//   fs.readFile(`./1-node-farm/starter/txt/${data1}.txt`, 'utf-8', (err, data2) => {
//     console.log(data2);
//     fs.readFile('./1-node-farm/starter/txt/append.txt', 'utf-8', (err, data3) => {
//       console.log(data3);

//       fs.writeFile('./1-node-farm/starter/txt/final.txt', `${data2}/n${data3}`, 'utf-8', err => {
//         console.log('Your file has been written 😄')
//       })
//     });
//   });
// });
// console.log("Will read file!")

/////////////////////BREAK///////////////////////////


//SERVER
const replaceTemplate = (temp, product) => {
  let output = temp.replace(/{%PRODUCTNAME%}/g, product.productName);
  output = output.replace(/{%IMAGE%}/g, product.image);
  output = output.replace(/{%PRICE%}/g, product.price);
  output = output.replace(/{%FROM%}/g, product.from);
  output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
  output = output.replace(/{%QUANTITY%}/g, product.quantity);
  output = output.replace(/{%DESCRIPTION%}/g, product.description);
  output = output.replace(/{%ID%}/g, product.id);
 
  if(!product.organic) output = output.replace(/{%NOT_ORGANIC%}/g, 'not-organic');
  return output;
}
const tempOverview = fs.readFileSync('./1-node-farm/starter/templates/template-overview.html', 'utf-8');
const tempCard = fs.readFileSync('./1-node-farm/starter/templates/template-card.html', 'utf-8');
const tempProduct = fs.readFileSync('./1-node-farm/starter/templates/template-product.html', 'utf-8');

const data = fs.readFileSync('./1-node-farm/starter/dev-data/data.json', 'utf-8');
const dataObj = JSON.parse(data);

const server = http.createServer((req, res) => {
  const pathName = req.url;

//Overview page
  if (pathName === '/' || pathName === '/overview') {
    res.writeHead(200, { 'Content-type': 'text/html'});

    const cardsHtml = dataObj.map(el => replaceTemplate(tempCard, el)).join('');
    const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);
    res.end(output);


//Product page
  } else if (pathName === '/product') {
    res.end('This is the PRODUCT!')

//API
  } else if (pathName === '/api') {
      res.writeHead(200, { 'Content-type': 'application/json'});
      res.end(data);

//Not found
  } else {
    res.writeHead(404, {
      'Content-type': 'text/html',
      'my-own-header': 'hello-world'
    });
    res.end('<h1>PAGE NOT FOUND!</h1>');
  }
});

server.listen(8000, '127.0.0.1', () => {
  console.log('Listening to requests on Port 8000');
})

