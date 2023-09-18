const fs = require('fs');
const http = require('http');
const url = require('url');
const slugify = require('slugify');
const replaceTemplate = require('./modules/replaceTemplate');

// const

// SERVER

const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);

const slugs = dataObj.map(el => slugify(el.productName, {lower: true}));

console.log(slugs);

const server = http.createServer((req, res) => {
  // console.log(req);
  // console.log(req.url);
  
  const {query, pathname} = url.parse(req.url, true);
  
  const pathName = req.url;
  if(pathname==='/' || pathname==='/overview') {
    res.writeHead(200,{'Content-type': 'text/html'});
    // console.log(tempCard);

    const cardsHtml = dataObj.map(el => replaceTemplate(tempCard, el)).join('');
    // console.log(cardsHtml);
    const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);
    // console.log(cardsHtml);
    res.end(output);




  } else if (pathname==='/product') {
    // console.log(query);
    res.writeHead(200,{'Content-type': 'text/html'});
    const product = dataObj[query.id];
    // console.log(product);
    const output = replaceTemplate(tempProduct, product);
    res.end(output);



  } else if (pathName==='/api') {
    // Reading the File each time the page is logged 
    // fs.readFile(`${__dirname}/dev-data/data.json`, 'utf-8', (err,data) => {
    //   const productData = JSON.parse(data);
    //   // console.log(productData);
    //   res.writeHead(200,{
    //     'Content-type': 'application/json'
    //   });
    //   res.end(data);
    // });

    // Below reads the data from top-level code only once when the server is started
    res.writeHead(200,{'Content-type': 'application/json'});
    res.end(data);





  } else {
    res.writeHead(404, {
      'Content-type': 'text/html',
      'my-own-header': 'hello-world'
    });
    res.end('<h1>Page not found!<\h1>');
    // console.log(http.status);
  };
  // res.end('Hello from the server!');
});

server.listen(8000, '127.0.0.1', () => {
  console.log('Listening to requests on port 8000');
});



/*
const hello = 'Hello world';
console.log(hello);
*/

// FILES

// Blocking synchronous way
/*
const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');
console.log(textIn);

const textOut = `This is what we know about the avocado: ${textIn}\nCreated on ${Date.now()}`;

fs.writeFileSync('./txt/output.txt', textOut);

console.log(textOut);
console.log('File written!');
*/

// Non-blocking asynchronus way
/*
fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
  if (err) return console.log('ERROR');

  fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
    console.log(data2);
    fs.readFile('./txt/append.txt', 'utf-8', (err, data3) => {
      console.log(data3);

      fs.writeFile('./txt/final.txt', `${data2}\n${data3}`, 'utf-8', err => {
        console.log('Your file has been written 😁')
      })
    });
  });
});
console.log('Will read file!');
*/