const fs = require("fs");
const http = require("http");
const url = require("url");
const replaceTemplate = require("./modules/replaceTemplate");

////////////////////////////
// FILES
//bocking, synchroinous way

// const textIn = fs.readFileSync("./txt/input.txt", "utf-8");
// console.log(textIn);
// const textOut = `this is ${textIn}\n Created on ${Date.now()}`;
// fs.writeFileSync("./txt/output.txt", textOut);
// console.log("New File written");

//non-blocking- asynchronous way
// fs.readFile("./txt/start.txt", "utf-8", (err, data1) => {
//   if (err) return console.log("errrrrrrrrrrrrrror");
//   fs.readFile(`./txt/${data1}.txt`, "utf-8", (err, data2) => {
//     console.log(data2);
//     fs.readFile(`./txt/append.txt`, "utf-8", (err, data3) => {
//       console.log(data3);
//       fs.writeFile("./txt/final.txt", `${data2}\n${data3}`, "utf-8", (err) => {
//         console.log("Your file has been written !");
//       });
//     });
//   });
// });
// console.log("Will read files");

/////////////////////////////
// SERVER
const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  "utf-8"
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  "utf-8"
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8"
);
const data = fs.readFileSync("./dev-data/data.json", "utf-8");
const dataObj = JSON.parse(data);

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);
  let cardsHtml = {};
  let output;
  let product;
  //OVERVIEW PAGE
  pathname === "/" || pathname === "/overview"
    ? (res.writeHead(200, { "Content-type": "text/html" }),
      (cardsHtml = dataObj.map((el) => replaceTemplate(tempCard, el)).join("")),
      (output = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHtml)),
      res.end(output))
    : //PRODUCT PAGE
    pathname === "/product"
    ? (res.writeHead(200, { "Content-type": "text/html" }),
      (product = dataObj[query.id]),
      (output = replaceTemplate(tempProduct, product)),
      res.end(output))
    : // API RESULT
    pathname === "/api"
    ? (res.writeHead(200, { "Content-type": "application/json" }),
      res.end(data))
    : //NOT FOUND
      (res.writeHead(404, {
        "Content-type": "text/html",
        "my-own-header": "hello-world",
      }),
      res.end("<h1>Page not found !</h1>"));
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Listening to requests on port 8000");
});
