const fs = require('fs');
const http = require('http');
const url = require('url');

const slugify = require('slugify');


const replaceTemplate = require('./modules/replaceTemplate');



////////////////////////////////
//FILES


////////////////////////////////
//SERVER



const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
const tempProduct = fs.readFileSync(`${__dirname}/templates/product.html`, 'utf-8');


const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);  


const slugs = dataObj.map(el => slugify(el.productName,{lower: true}));
console.log(slugs);
//slugify
// console.log(slugify('Fresh Avacados', {
//     lowercase: true
// }));

const server = http.createServer((req, res)=>{
        // console.log(req.url);
        // console.log(url.parse(req.url, true));
        
        const {query, pathname} = url.parse(req.url, true);

//Overview Page
       if(pathname === '/' || pathname === '/overview'){
        res.writeHead(200, {'Content-type': 'text/html'})  //200 == okay, object for JSON
       
        const cardsHtml = dataObj.map(el => replaceTemplate(tempCard, el)).join('');
        const output = tempOverview.replace('(%PRODUCT_CARDS%)', cardsHtml);
       
        res.end(output);

// Product page
       } else if (pathname === '/product') {
        //console.log(query);
        res.writeHead(200, {'Content-type': 'text/html'})  //200 == okay, 
        const product = dataObj[query.id];
        const output = replaceTemplate(tempProduct, product)
        res.end(output);

//API
       } else if (pathname === '/api'){
        //res.end('API') new route
        res.writeHead(200, {'Content-type': 'application/json'})  //200 == okay, object for JSON
        res.end(data);
       }

//Not found
       else {
        res.writeHead(404, {
            'Content-type': 'text/html',
            'my-own-header': 'hello-world'
        });
        res.end('<h1>Page not found</h1>');
       }
        // res.end('Hello from the server!');
    });
server.listen(8000, '127.0.0.1', () => {
    console.log('Listening on requests on port 8000');
}
);