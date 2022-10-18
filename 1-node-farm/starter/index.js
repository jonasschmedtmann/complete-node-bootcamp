const fs = require('fs');
const http = require('http');
const url = require('url');

//Blocking, synchronous code execution
// const textIN = fs.readFileSync('./txt/input.txt', 'utf-8');
// console.log(textIN);

// const textOut = `This is what we know about the avacado 🥑: ${textIN}.\nCreated on ${Date.now()}`;
// fs.writeFileSync('./txt/output.txt', textOut);
// console.log('File Written');


// //Non-blocking, asynchronous
// fs.readFile('./txt/start.txt',  'utf-8', (err, data1) =>{
//     fs.readFile(`./txt/${data1}.txt`,  'utf-8', (err, data2) =>{
//         console.log(data2);
//         fs.readFile(`./txt/append.txt`,  'utf-8', (err, data3) =>{
//             console.log(data3);
            
//             fs.writeFile('./txt/final.txt', `${data2}\n${data3}`,'utf-8', err =>{
//                     console.log('Your file has been written :)');
//             })
//            });
//        });
// });
// console.log('Will read!!');

////////////////////////////////
//FILES


////////////////////////////////
//SERVER

const replaceTemplate = (temp, product) => {
    let output = temp.replace(/{%PRODUCTNAME%}/g, product.productName);
    output = output.replace(/{%IMAGE%}/g, product.image);
    output = output.replace(/{%PRICE%}/g, product.price);
    output = output.replace(/{%FROM%}/g, product.from);
    output = output.replace(/{%QUANTITY%}/g, product.quantity);
    output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
    output = output.replace(/{%DESCRIPTION%}/g, product.description);
    output = output.replace(/{%ID%}/g, product.id);

    if(!product.organic)  output = output.replace(/{%NOT_ORGANIC%}/g, 'not-organic');
    return output;
}

const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
const tempProduct = fs.readFileSync(`${__dirname}/templates/product.html`, 'utf-8');


const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);  



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