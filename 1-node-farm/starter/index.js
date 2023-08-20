const fs = require("fs");
const http = require("http");
const url = require("url");

const replaceTemplate = require("./modules/replaceTemplate");
///////////////////
//// FILE SYSTEM

// Synchronous - Blocking
// const textIn = fs.readFileSync("./txt/input.txt", "utf-8");
// console.log(textIn);

// const textOut = `This is what we know about the avocado : ${textIn}. \nCreated on ${Date.now()}.`;
// fs.writeFileSync("./txt/output.txt", textOut);
// console.log("File written!");

// Async - Non blocking
// fs.readFile("./txt/starts.txt", "utf-8", (err, data1) => {
//   if (err) return console.log("Unable to read file!");
//   fs.readFile(`./txt/${data1}.txt`, "utf-8", (err, data2) => {
//     fs.readFile("./txt/append.txt", "utf-8", (err, data3) => {
//       fs.writeFile("./txt/final.txt", `${data2}\n${data3}`, "utf-8", (err) => {
//         console.log("File Written!");
//       });
//     });
//   });
// });

///////////////////
//// HTTP SERVER

const data = fs.readFileSync("./dev-data/data.json", "utf-8");
const parsedData = JSON.parse(data);

const templateOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  "utf-8"
);
const templateProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  "utf-8"
);
const templateCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8"
);

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  // OVERVIEW
  if (pathname === "/" || pathname === "/overview") {
    res.writeHead(200, { "Content-type": "text/html" });

    const cardsHTML = parsedData
      .map((el) => replaceTemplate(templateCard, el))
      .join("");
    const output = templateOverview.replace("{%PRODUCT_CARDS%}", cardsHTML);

    res.end(output);

    // PRODUCT
  } else if (pathname === "/product") {
    const product = parsedData[query.id];
    const output = replaceTemplate(templateProduct, product);

    res.writeHead(200, { "Content-type": "text/html" });
    res.end(output);

    // API
  } else if (pathname === "/api") {
    res.writeHead(200, {
      "Content-Type": "application/json",
    });
    res.end(data);

    // NOT FOUND
  } else {
    res.writeHead(404, {
      "Content-Type": "text/html",
    });
    res.end("<h1>Page not found!!!</h1>");
  }
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Listening to requests on port 8000...");
});
