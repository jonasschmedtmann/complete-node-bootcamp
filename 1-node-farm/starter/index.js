const fs = require("fs");
const http = require("http");
const url = require("url");
///////////////////////
////////// FILES
// const hello = "hello world";
// // const textIn = fs.readFileSync("./txt/input.txt", "utf-8"); // readFileSync("./path","") takes two arguments, first one is reading file we want,second is character encoding
// //BLOCKING SYNCHRONOUS CODES LINES 4-10
// console.log(textIn);
// const textOut = `About avocado ${textIn}.\n Created on ${Date.now()}`;
// fs.writeFileSync("./txt/output.txt", textOut); // writeFileSync("./path","text") takes two arguments, first one  is the path to the file where the data will be written, second is the data that will be written to the file. if first data doesn't exist writeFileSync create a new file.
// const readTextOut = fs.readFileSync("./txt/output.txt", "utf-8");
// console.log(readTextOut);

// NON-BLOCKING ASYNCHRONOUS CODES
// fs.readFile("./txt/start.txt", "utf-8", (err, data1) => {
//   console.log(data1); // the output will be read-this
//   fs.readFile(`./txt/${data1}.txt`, "utf-8", (err, data2) => {
//     console.log(data2); // the output will be the content of read-this.txt
//     fs.readFile("./txt/append.txt", "utf-8", (err, data3) => {
//       console.log(data3); // the output will be the content of append.txt
//       fs.writeFile("./txt/final.txt", `${data2}\n${data3}`, "utf-8", (err) => {
//         console.log("Your file has been written"); // content of final.txt will be data2(content of read-this.txt)+data3(content of append.txt)
//       });
//     });
//   });
// });
// console.log("will read file...");

///////////////////////
////////// SERVER
const replaceTemplate = (temp, product) => {
  let output = temp
    .replace(/{%PRODUCTNAME%}/g, product.productName)
    .replace(/{%IMAGE%}/g, product.image)
    .replace(/{%FROM%}/g, product.from)
    .replace(/{%NUTRIENTS%}/g, product.nutrients)
    .replace(/{%QUANTITY%}/g, product.quantity)
    .replace(/{%PRICE%}/g, product.price);
  if (!product.organic)
    output = output.replace(/{%NOT_ORGANIC%}/g, "not-organic");
  output = output
    .replace(/{%ID%}/g, product.id)
    .replace(/{%DESCRIPTION%}/g, product.description);
  return output;
};
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const dataObj = JSON.parse(data);
const tempCard = fs.readFileSync("./templates/template-card.html", "utf-8");
const tempProduct = fs.readFileSync(
  "./templates/template-product.html",
  "utf-8"
);
const tempOverview = fs.readFileSync(
  "./templates/template-overview.html",
  "utf-8"
);

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  if (pathname === "/" || pathname === "/overview") {
    res.writeHead(200, { "Content-type": "text/html" });
    const cardsHtml = dataObj
      .map((el) => replaceTemplate(tempCard, el))
      .join("");
    const output = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHtml);
    res.end(output);
  } else if (pathname === "/product") {
    res.writeHead(200, { "Content-type": "text/html" });
    const product = dataObj[query.id];
    const output = replaceTemplate(tempProduct, product);
    res.end(output);
  } else if (pathname === "/api") {
    res.writeHead(200, { "Content-type": "application/json" }); //for JSON format
    res.end(data);
  } else {
    res.writeHead(404, {
      "Content-type": "text/html", //browser expecting some HTML
      "my-own-header": "hello-world", //Created my own header
    });
    res.end("<h1>Page not found...</h1>");
  }
  //res.end("Hello from the server!"); //  when a request is received, the server will respond with the message
}); // create an HTTP server

server.listen(8000, "127.0.0.1", () => {
  console.log("Listening to requests on port 8000"); // callback function runs when listening start
}); //will start listening for incoming requests(starting up the server)
