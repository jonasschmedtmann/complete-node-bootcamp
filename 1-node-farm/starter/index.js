const fs = require('fs');
const http = require('http');
const url = require('url');
const replaceTemplate = require('./modules/replaceTemplates');
const slugify = require('slugify');
// Reading file
//
// const textIn = fs.readFileSync('./txt/input.txt', 'utf-8')
// console.log(textIn)

// Writing file
// Blocking, Synchronous way
// const fs = require('fs')
// const textOut = fs.writeFileSync('./txt/output.txt', "Now you see me")
// console.log("File Written")

// Non-blocking, asynchrounous
// fs.readFile('./txt/start.txt', 'utf-8', (err, data1) =>{
//     fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) =>{
// console.log(data2)
// fs.readFile('./txt/append.txt', 'utf-8', (err, data3) =>{
// console.log(data3)
// fs.writeFile("./txt/final.txt",`${data2} \n ${data3}`, 'utf-8', err => {
//     console.log('Your file has been written😁')
// })
// })
// })
// })
// console.log("will read file")

// BUILDING A SERVER

const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);

const slugs = dataObj.map((el) => slugify(el.productName, { lower: true }));

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  //    Overview page

  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, {
      'content-type': 'text/html',
    });

    const cardsHTML = dataObj.map((el) => replaceTemplate(tempCard, el)).join('');
    const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHTML);
    res.end(output);

    // Product page
  } else if (pathname === '/product') {
    res.writeHead(200, {
      'content-type': 'text/html',
    });
    const product = dataObj[query.id];
    const output = replaceTemplate(tempProduct, product);
    res.end(output);

    // Api
  } else if (pathname === '/api') {
    res.writeHead(200, {
      'content-type': 'application/json',
    });
    res.end(data);

    //    Not Found
  } else {
    res.writeHead(404, {
      'content-type': 'text/html',
    });
    res.end('<h1>page not found</h1>');
  }
});
server.listen(8000, '127.0.0.1', () => {
  console.log('Listening to requests on port 8000');
});
