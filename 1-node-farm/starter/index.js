const fs = require("fs");
const http = require("http");
const url = require("url");

// Here we use '.' for dir of current running mondule(file) instead of __dir
const replaceTemplate = require("./modules/replaceTemplate");

// Blocking, scyncronus way
// const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');
// console.log(textIn);
// const textOut = `This is hat we know about the avocado ${textIn}.\nCreated on ${Date.now()}`;
// fs.writeFileSync('./txt/output.txt', textOut);

// Non-Blocking, asyncronous way
// fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
//     if (err) return console.log('Error reading file');
//     fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
//         console.log(data2);
//
//         fs.readFile(`./txt/append.txt`, 'utf-8', (err, data3) => {
//         console.log(data3);
//
//             fs.writeFile('./txt/final.txt',`${data2}\n${data3}`, 'utf-8', err => {
//             console.log('Your file has been written');
//             })
//         });
//     });
// });
//
// console.log('Will read this');
///////////////////////////////////////////////////////////////////////////////

// Server
//
// Load templates into memory so they are not loaded on each request
// Can use Sync here are we are running this once when the server starts,
// if we did this in the request, it would block.
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf8");
const dataObj = JSON.parse(data);

const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  "utf8"
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf8"
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  "utf8"
);

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  // Overview page
  if (pathname === "/" || pathname === "/overview") {
    res.writeHead(200, {
      "Content-type": "text/html",
    });

    const cardsHtml = dataObj
      .map((el) => replaceTemplate(tempCard, el))
      .join("");

    const output = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHtml);
    res.end(output);
  }

  // Product page
  else if (pathname === "/product") {
    res.writeHead(200, {
      "Content-type": "text/html",
    });
    const product = dataObj[query.id];
    const output = replaceTemplate(tempProduct, product);

    res.end(output);
  }

  // API
  else if (pathname === "/api") {
    res.writeHead(200, {
      "Content-type": "application/json",
    });
    res.end(data);
  }

  // Not found
  else {
    res.writeHead(404, {
      "Content-type": "text/html",
      "My-header": "Hello-world",
    });
    res.end("<h1>Page not found!</h1>");
  }
});

server.listen(3000, "127.0.0.1", () => {
  console.log("listneing to requests on port 3000");
});
