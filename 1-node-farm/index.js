// Files
const fs = require("fs"); // API for interacting with the file system
const http = require("http");
const url = require("url");
const replaceTemplate = require("./starter//modules/replaceTemplate.js");

/*
////////// Files

// Blocking >> sync
const textIn = fs.readFileSync(`${__dirname}/starter/txt/start.txt`, 'utf-8');
// console.log(textIn);
const textOut = `This is a copy from another file : ${textIn}.\n Created on ${Date(Date.now()).toString()}.`;
fs.writeFileSync(`${__dirname}/starter/txt/output.txt`, textOut);
console.log('File copy completed!');
*/

/* 
// Non-blocking >> async
fs.readFile(`${__dirname}/starter/txt/start.txt`, "utf-8", (err, data1) => {
  if (err) return console.log("Error in file...");
  fs.readFile(`${__dirname}/starter/txt/${data1}.txt`, "utf-8", (err, data2) => {
    console.log(data2); // open file "read-this"
    fs.readFile(`${__dirname}/starter/txt/append.txt`, "utf-8", (err, data3) => {
      console.log(data3);
      fs.writeFile(
        `${__dirname}/starter/txt/final.txt`,
        `${data2}\n${data3}`,
        "utf-8",
        (err) => {
          console.log("File written...");
        }
      );
    });
  });
});
console.log("Will read file...");
*/

////////// Server
/* */

const statusCodeOK = 200;
const statusCodeNotFound = 404;

const tempOverview = fs.readFileSync(
  `${__dirname}/starter/templates/template-overview.html`,
  "utf-8"
);
const tempCard = fs.readFileSync(
  `${__dirname}/starter/templates/template-card.html`,
  "utf-8"
);

const tempProduct = fs.readFileSync(
  `${__dirname}/starter/templates/template-product.html`,
  "utf-8"
);

const data = fs.readFileSync(
  `${__dirname}/starter/dev-data/data.json`,
  "utf-8"
);

const dataObj = JSON.parse(data);

const sendHttpCommand = (res, statusCode, contentType, command) => {
  let formatedContentType = `Content-type": "${contentType}"`;
  res.writeHead(statusCode, { formatedContentType });
  res.end(command);
};

const sendCommandPageNotFound = (res) => {
  sendHttpCommand(
    res,
    statusCodeNotFound,
    "text/html",
    "<h1>Page not found!</h1>"
  );
};

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);
  console.log(pathname);
  console.log(url.parse(req.url, true));

  // Overview
  if (pathname === "/" || pathname === "/overview") {
    const cardsHtml = dataObj
      .map((el) => replaceTemplate(tempCard, el))
      .join("");
    const output = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHtml);
    sendHttpCommand(res, statusCodeOK, "text/html", output);
    // Product
  } else if (pathname === "/product") {
    if (query.id < dataObj.length) {
      const product = dataObj[query.id];
      const productHtmlPage = replaceTemplate(tempProduct, product);
      sendHttpCommand(res, statusCodeOK, "text/html", productHtmlPage);
    } else {
      sendCommandPageNotFound(res);
    }

    // API
  } else if (pathname === "/api") {
    sendHttpCommand(res, statusCodeOK, "application/json", data);
    // 404
  } else {
    sendCommandPageNotFound(res);
  }
});

server.listen(8080, "127.0.0.1", () => {
  console.log("Listening to requests on port 8080");
});
