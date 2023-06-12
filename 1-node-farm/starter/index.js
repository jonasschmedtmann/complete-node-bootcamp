const fs = require('fs');
const http = require('http');
const url = require('url');

const slugify =  require('slugify');

const replaceTemplate = require('./modules/replaceTemplate');

/////////////////////////////////////////
// FIles
/* // Blocking, synchronous way
const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');
// console.log(textIn);
const textOut = `This is what we know about the avocado: ${textIn} on ${Date.now()}`;
fs.writeFileSync('./txt/output.txt',textOut);
console.log('File written!'); */



// Blocking, asynchronous way

// fs.readFile('./txt/startcds.txt', 'utf-8',(err , data1) => {
//     if (err) return console.log('Error');
//     fs.readFile(`./txt/${data1}.txt`, 'utf-8',(err , data2) => {
//         console.log(data2);
//         fs.readFile('./txt/append.txt', 'utf-8',(err , data3) => {
//             console.log(data3);
//             fs.writeFile('./txt/final.txt',`${data2}\n${data3}`, 'utf-8', err => {
//                 console.log('Your File has been written ')

//             })
//         });
//     });
// });

// console.log(' Will read file!');



/////////////////////////////////////////
// SERVER

const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');

const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');

const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');

const datObj = JSON.parse(data);

const slugs = datObj.map(el => slugify(el.productName, {lower: true}));

const server = http.createServer((req, res) => {
    const {query, pathname} = url.parse(req.url, true);

    // OVERVIEW page
    if(pathname === '/' || pathname ===  '/overview'){
        res.writeHead(200, {'Content-type' : 'text/html'});

        const cardsHtml = datObj.map(el => replaceTemplate(tempCard, el)).join('');
        const Updated_tempOverview = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);
        res.end(Updated_tempOverview);

    // PRODUCT page
    } else if (pathname === '/product'){
        res.writeHead(200, {'Content-type' : 'text/html'});
        const product = datObj[query.id]
        const productHtml = replaceTemplate(tempProduct, product);

        res.end(productHtml);

    // API page
    } else if (pathname === '/api') {
        res.writeHead(200, {'Content-type' : 'application/json'});
        res.end(data);

    // NOT found
    } else{
        res.writeHead(404, {
            'content-type': 'text/html',
            'my-own-header': 'hello-world'
        });
        res.end('<h1>Page Not found!</h1>');
    }
});



server.listen(8000,'localhost', () => {
    console.log('Listening to requess on port 8000')
});



