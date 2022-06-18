const fs = require('fs');
const http = require('http');
const url = require('url');

const replaceTemplate = require('./modules.js/replaceTemplalte')


//////////////////////////////////////////
///// FILES


// Blocking , synchronous way:-

// const textIn = fs.readFileSync('./starter/txt/input.txt', 'utf-8');

// textOut = `This is what we know about the avocado : - ${textIn}`;

// fs.writeFileSync('./starter/txt/output.txt', textOut);
// console.log("File has been written successfully :D");


// Non-Blocking, Asynchronoous way:-

// fs.readFile('./starter/txt/start.txt', 'utf-8', (err, data1)=>{
//     fs.readFile(`./starter/txt/${data1}.txt`, 'utf-8', (err, data2)=>{
//         console.log(data2);
//         fs.readFile('./starter/txt/append.txt', 'utf-8', (err, data3)=>{
//             console.log(data3);
//             fs.writeFile('./starter/txt/final.txt',`${data2}\n${data3}`, 'utf-8', err =>{
//                 console.log("File has been written 😁");
//             })
//         });
//     })
// });
// console.log("Will be read");




//////////////////////////////////////////
///// SERVER

//function to replace the template with json data


const Overviewdata = fs.readFileSync(`${__dirname}/starter/templates/template-overview.html`, 'utf-8');
const productdata = fs.readFileSync(`${__dirname}/starter/templates/template-product.html`, 'utf-8');
const carddata = fs.readFileSync(`${__dirname}/starter/templates/template-card.html`, 'utf-8');
const data = fs.readFileSync(`${__dirname}/starter/dev-data/data.json`, 'utf-8');
const apiData = JSON.parse(data);

// creating the server
const server = http.createServer((req,res)=>{

    const {query, pathname} = url.parse(req.url, true)

    // overview page
    if(pathname === '/' || pathname === '/overview'){
        res.writeHead('200',{'Content-type': 'text/html'})

        const cardsHtml = apiData.map(el => replaceTemplate(carddata,el)).join('');
        // console.log(cardsHtml);
        const output = Overviewdata.replace('{%TEMPLATE-CARDS%}', cardsHtml);
        
        res.end(output);

    }
    //product page
    else if(pathname === '/product'){
        res.writeHead('200',{'Content-type': 'text/html'})
        const product = apiData[query.id];
        const output = replaceTemplate(productdata, product);
        res.end(output)
    }
    // API
    else if (pathname === '/api'){
        res.writeHead('200',{'Content-type': 'application/json'})
            res.end(data);

        // res.end('This is API page');
    }
    //Page not found
    else
        res.end('Page not found')
    

});


//starting the server which we have created above
server.listen('8000', '127.0.1.1',()=>{
    console.log('Started to listen the 8000 port')
})