const fs = require("fs");
const http = require("http");
const url = require("url");
//
// // Blocking, scyncronus way
// const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');
// console.log(textIn);
// const textOut = `This is hat we know about the avocado ${textIn}.\nCreated on ${Date.now()}`;
// fs.writeFileSync('./txt/output.txt', textOut);
//

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
const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  "utf8"
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf8"
);
const templateProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  "utf8"
);
const dataObj = JSON.parse(data);

const replaceTemplate = (temp, product) => {
  output = temp.replace(/{%PRODUCTNAME%}/g, product.productName);
  output = output.replace(/{%IMAGE%}/g, product.image);
  output = output.replace(/{%PRICE%}/g, product.price);
  output = output.replace(/{%FROM%}/g, product.from);
  output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
  output = output.replace(/{%QUANTITY%}/g, product.quantity);
  output = output.replace(/{%DESCRIPTION%}/g, product.description);
  output = output.replace(/{%ID%}/g, product.id);
  output = output.replace(/{%PRODUCTWEIGHT%}/g, product.weight);

  if (!product.organic) {
    output = output.replace(/{%NOT_ORGANIC%}/g, "not-organic");
  }
  return output;
};

const server = http.createServer((req, res) => {
  const path = req.url;

  // Overview page
  if (path === "/" || path === "/overview") {
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
  else if (path === "/product") {
    res.end("This is the product");
  }

  // API
  else if (path === "/api") {
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
