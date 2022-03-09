const fileSystem = require('fs');
const http = require('http');
const url = require('url');
const slugify = require('slugify');

const replaceTemplate = require('./modules/replaceTemplate');

console.log(slugify('slug my text', { lower: true }));

/*const welcome ='Welcome to Node JS';

console.log(welcome);*/

/*
//Blocking, synchronous way
const textVal = fileSystem.readFileSync('./txt/input.txt', 'utf-8');
//if we don't mention the character encoding - we get a buffer instead of text

const ourText = `Here is some content from input.txt - ${textVal}. Generated on ${Date.now()}`;

fileSystem.writeFileSync('./txt/output.txt', ourText);

const fromOutputFile = fileSystem.readFileSync('./txt/output.txt', 'utf-8');

console.log(fromOutputFile);
*/

//Non-blocking, Asynchronous way
/*
fileSystem.readFile('./txt/start.txt', 'utf-8', (err, data)=>{
    if(err) return console.log('ERROR!');
    
    fileSystem.readFile(`./txt/${data}.txt`, 'utf-8', (err, data1)=>{
            console.log(data1);
        fileSystem.readFile(`./txt/append.txt`, 'utf-8', (err, data2)=>{
            console.log(data2);
            
            fileSystem.writeFile('./txt/final.txt', `${data1}\n${data2}`, 'utf-8', (err)=>{
                if(!err){
                    console.log('success');
                }
            });
        });
    });
}); //readFile method takes a call back as the third argument
   console.log('this prints before the data from start.txt file');

*/

///////////////////////////
//SERVER

var overview_template = fileSystem.readFileSync(
  `${__dirname}/templates/overview.html`,
  'utf-8'
);

var product_template = fileSystem.readFileSync(
  `${__dirname}/templates/product.html`,
  'utf-8'
);

var template_card = fileSystem.readFileSync(
  `${__dirname}/templates/template_card.html`,
  'utf-8'
);

var data = fileSystem.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8'); //gets string data
var dataObject = JSON.parse(data); //converting string to object to loop later

http.createServer((req, res) => {
    const { query, pathname } = url.parse(req.url, true); //pass true to parse the query parameter into an object

    //Overview page
    if (pathname == '/' || pathname == '/overview') {
      const cardsHTML = dataObject
        .map(el => replaceTemplate(template_card, el))
        .join('');

      const allCardsHTML = overview_template.replace(
        /{%PRODUCT_CARDS%}/g,
        cardsHTML
      );

      res.writeHead(200, {
        'Content-type': 'text/html'
      });

      res.end(allCardsHTML);
    }

    //Product page
    else if (pathname == '/product') {
      res.writeHead(200, {
        'Content-type': 'text/html'
      });

      const product = dataObject[query.id];
      const output = replaceTemplate(product_template, product);

      res.end(output);
    }

    //API
    else if (pathname == '/api') {
      res.writeHead(200, {
        'Content-type': 'application/json'
      });
      res.end(data);
    }

    //Not found
    else {
      res.writeHead(404, {
        //status code
        'Content-type': 'text/html', //header
        'my-custom-header': 'hello-world' //header
      });
      res.end('<h1>Page not found</h1>');
    }
  })
  .listen(8000, '127.0.0.1', () => {
    //port, host is current computer
    console.log('listening to requests on port 8000');
  });
