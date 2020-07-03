const fs = require('fs');   //requires the file_system module
const http = require('http') // gives us networking capability 
const url = require('url'); // gives us routing capability 

const slugify = require('slugify');

const replaceTemplate = require('./modules/replaceTemplate');

const { runInNewContext } = require('vm');
const { resourceUsage } = require('process');


// SERVER
const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);

// 3rd party
// console.log(slugify('Fresh Avocados', {lower: true })); // to test
const slugs = dataObj.map(el => slugify(el.productName, { lower: true }));
console.log(slugs);

// create server
const server = http.createServer((req, res) => {
    const { query, pathname } = url.parse(req.url, true);   

    // Overview Page
    if(pathname === '/' || pathname === '/overview') {
        res.writeHead(200, { 'Content-type': 'text/html'});
        const cardsHtml = dataObj.map(el => replaceTemplate(tempCard, el)).join('');
        const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);
        res.end(output);

    // Product Page    
    } else if (pathname === '/product') {
        res.writeHead(200, { 'Content-type': 'text/html'});
        const product = dataObj[query.id];
        const output = replaceTemplate(tempProduct, product);
        res.end(output);

    // API
    } else if (pathname === '/api') {
        res.writeHead(200, { 'Content-type': 'application/json'});
        res.end(data);

    // Not found    
    } else {
        res.writeHead(404, {
            'Content-type': 'text/html',
            'my-own-header': 'hello world'   
        });
        res.end('<h1>Page not found!</h1>');
    }
});

server.listen(5500, '127.0.0.1', () => {      
    console.log('Listening to requests on port 5500');
});  





// // ***********************FILE_SYSTEM MODULE***********************
// // BLOCKING, SYNCHRONOUS WAY
// read files
// const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');
// console.log(textIn);
// // write files
// const textOut = `This is what we know about the avocado: ${textIn}. \nCreated on ${Date.now()}`;
// fs.writeFileSync('./txt/output.txt', textOut);
// console.log("File written!");

// // NON-BLOCKING, ASYNCHRONOUS WAY
// fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
//     if (err) return console.log('Error! 🤮');
//     fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
//         console.log(data2);
//         if (err) return console.log('Error2! 🥵');
//         fs.readFile('./txt/append.txt', 'utf-8', (err, data3) => {
//             console.log(data3);
//             if (err) return console.log('Error3! 🤬');
//             fs.writeFile('./txt/final.txt', `${data2}\n${data3}`, 'utf-8', err => {
//                 console.log('Your file has been written ');
//             });
//         }); 
//     }); 
// }); 
// console.log('Will read file!');



// // ***********************HTTP MODULE(SERVER)***********************
// const server = http.createServer((req, res) => {
//     // console.log(req);   // will show the request object in the terminal but it is huge so I will uncomment
//     res.end('Hello from the server!');
// });

// server.listen(5500, '127.0.0.1', () => {        // localhostIP = 127.0.0.1 & port is 5500
//     console.log('Listening to requests on port 5500');
// });   // control + c (to exit the application, not control + d, when you are just in a regular node repl)


// // ***********************URL MODULE(ROUTING)***********************
// const server = http.createServer((req, res) => {
//     console.log(req.url);  // will show the (parsed) url in the terminal (to be used later)
//     res.end('Hello from the server!');
// });

// server.listen(5500, '127.0.0.1', () => {      
//     console.log('Listening to requests on port 5500');
// });  

// // ***********************URL MODULE(ROUTING)***********************
// const server = http.createServer((req, res) => {
//     const pathName = req.url;

//     if(pathName === '/' || pathName === '/overview') {
//         res.end('This is the OVERVIEW');
//     }else if (pathName === '/product') {
//         res.end('This is the PRODUCT');
//     } else {
//         res.writeHead(404, {
//             'Content-type': 'text/html',
//             'my-own-header': 'hello world'   
//         });
//         res.end('<h1>Page not found!</h1>');
//     }
// });



// // ***********************URL MODULE(ROUTING & API)***********************
// const server = http.createServer((req, res) => {
//     const pathName = req.url;

//     if(pathName === '/' || pathName === '/overview') {
//         res.end('This is the OVERVIEW');
//     } else if (pathName === '/product') {
//         res.end('This is the PRODUCT');
//     } else if (pathName === '/api') {
//         // fs.readFile('./dev-data/data.json'); // or can use:
//         fs.readFile(`${__dirname}/dev-data/data.json`, 'utf-8', (err, data) => {
//             const productData = JSON.parse(data);
//             console.log(productData);s
//         });
//         res.end('API');
//     } else {
//         res.writeHead(404, {
//             'Content-type': 'text/html',
//             'my-own-header': 'hello world'   
//         });
//         res.end('<h1>Page not found!</h1>');
//     }
// });

// server.listen(5500, '127.0.0.1', () => {      
//     console.log('Listening to requests on port 5500');
// });  

// // ***********************URL MODULE(ROUTING & API)***********************
// const server = http.createServer((req, res) => {
//     const pathname = req.url;

//     if(pathname === '/' || pathname === '/overview') {
//         res.end('This is the OVERVIEW');
//     } else if (pathname === '/product') {
//         res.end('This is the PRODUCT');
//     } else if (pathname === '/api') {
//         fs.readFile(`${__dirname}/dev-data/data.json`, 'utf-8', (err, data) => {
//             const productData = JSON.parse(data);
//             res.writeHead(200, { 'Content-type': 'application/json'});
//             res.end(data);
//         })

//     } else {
//         res.writeHead(404, {
//             'Content-type': 'text/html',
//             'my-own-header': 'hello world'   
//         });
//         res.end('<h1>Page not found!</h1>');
//     }
// });

// server.listen(5500, '127.0.0.1', () => {      
//     console.log('Listening to requests on port 5500');
// });  


// // ***********************URL MODULE(ROUTING & API)***********************


// //okay that this is synchronous/blocking since only read once
// const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
// const dataObj = JSON.parse(data);

// const server = http.createServer((req, res) => {
//     const pathname = req.url;

//     if(pathname === '/' || pathname === '/overview') {
//         res.end('This is the OVERVIEW');
//     } else if (pathname === '/product') {
//         res.end('This is the PRODUCT');
//     } else if (pathname === '/api') {
//         res.writeHead(200, { 'Content-type': 'application/json'});
//         res.end(data);
//     } else {
//         res.writeHead(404, {
//             'Content-type': 'text/html',
//             'my-own-header': 'hello world'   
//         });
//         res.end('<h1>Page not found!</h1>');
//     }
// });

// server.listen(5500, '127.0.0.1', () => {      
//     console.log('Listening to requests on port 5500');
// });  





// // ***********************URL MODULE(ROUTING & API)***********************
// // SERVER
// const replaceTemplate = (temp, product) => {
//     let output = temp.replace(/{%PRODUCT_NAME%}/g, product.productName);
//         output = output.replace(/{%IMAGE%}/g, product.image);
//         output = output.replace(/{%PRICE%}/g, product.price);
//         output = output.replace(/{%FROM%}/g, product.from);
//         output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
//         output = output.replace(/{%QUANTITY%}/g, product.quantity);
//         output = output.replace(/{%DESCRIPTION%}/g, product.description);
//         output = output.replace(/{%ID%}/g, product.id);

//     if (!product.organic) output = output.replace(/{%NOT_ORGANIC%}/g, 'not-organic');
//     return output;
// }

// const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
// const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
// const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');

// const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
// const dataObj = JSON.parse(data);

// const server = http.createServer((req, res) => {
//     const pathname = req.url;

//     // Overview Page
//     if(pathname === '/' || pathname === '/overview') {
//         res.writeHead(200, { 'Content-type': 'text/html'});

//         const cardsHtml = dataObj.map(el => replaceTemplate(tempCard, el)).join('');
//         const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);

//         res.end(output);

//     // Product Page    
//     } else if (pathname === '/product') {
//         res.end('This is the Product');
//         // res.writeHead(200, { 'Content-type': 'text/html'});
//         // res.end(tempProduct);

//     // API
//     } else if (pathname === '/api') {
//         res.writeHead(200, { 'Content-type': 'application/json'});
//         res.end(data);

//     // Not found    
//     } else {
//         res.writeHead(404, {
//             'Content-type': 'text/html',
//             'my-own-header': 'hello world'   
//         });
//         res.end('<h1>Page not found!</h1>');
//     }
// });

// server.listen(5500, '127.0.0.1', () => {      
//     console.log('Listening to requests on port 5500');
// });  




// // ***********************URL MODULE(ROUTING & API)***********************
// // ***********************PARSING VARIABLES FROM URLs**********************
// // SERVER
// const replaceTemplate = (temp, product) => {
//     let output = temp.replace(/{%PRODUCT_NAME%}/g, product.productName);
//         output = output.replace(/{%IMAGE%}/g, product.image);
//         output = output.replace(/{%PRICE%}/g, product.price);
//         output = output.replace(/{%FROM%}/g, product.from);
//         output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
//         output = output.replace(/{%QUANTITY%}/g, product.quantity);
//         output = output.replace(/{%DESCRIPTION%}/g, product.description);
//         output = output.replace(/{%ID%}/g, product.id);

//     if (!product.organic) output = output.replace(/{%NOT_ORGANIC%}/g, 'not-organic');
//     return output;
// }

// const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
// const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
// const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');

// const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
// const dataObj = JSON.parse(data);

// const server = http.createServer((req, res) => {
//     const { query, pathname } = url.parse(req.url, true);   

//     // Overview Page
//     if(pathname === '/' || pathname === '/overview') {
//         res.writeHead(200, { 'Content-type': 'text/html'});
//         const cardsHtml = dataObj.map(el => replaceTemplate(tempCard, el)).join('');
//         const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);
//         res.end(output);

//     // Product Page    
//     } else if (pathname === '/product') {
//         res.writeHead(200, { 'Content-type': 'text/html'});
//         const product = dataObj[query.id];
//         const output = replaceTemplate(tempProduct, product);
//         res.end(output);

//     // API
//     } else if (pathname === '/api') {
//         res.writeHead(200, { 'Content-type': 'application/json'});
//         res.end(data);

//     // Not found    
//     } else {
//         res.writeHead(404, {
//             'Content-type': 'text/html',
//             'my-own-header': 'hello world'   
//         });
//         res.end('<h1>Page not found!</h1>');
//     }
// });

// server.listen(5500, '127.0.0.1', () => {      
//     console.log('Listening to requests on port 5500');
// });  