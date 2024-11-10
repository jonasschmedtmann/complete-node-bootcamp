const fs = require("fs");
const http = require("http");
const url = require("url");
const slugify = require("slugify");
const replaceProductTemplate = require("./starter/modules/replaceTemplate");

const OVERVIEW_ROUTE = "/overview";
const ROOT = "/";
const PRODUCT_ROUTE = "/product";
const API_ROUTE = "/api";

//here we used readFileAsync to load all products data and templates at the beginning
const productData = fs.readFileSync("./starter/dev-data/data.json", "utf-8");
const templateOverview = fs.readFileSync(
  "./starter/templates/overview.html",
  "utf-8"
);
const templateProduct = fs.readFileSync(
  "./starter/templates/product.html",
  "utf-8"
);
const templateProductCard = fs.readFileSync(
  "./starter/templates/product-card.html",
  "utf-8"
);

const jsonData = JSON.parse(productData);
const slugs = jsonData.map((product) =>
  slugify(product.productName, { lowercase: true })
);

const server = http.createServer((request, response) => {
  const { query, pathname } = url.parse(request.url, true);
  switch (pathname) {
    case ROOT:
    case OVERVIEW_ROUTE:
      displayAllProducts(response);
      break;
    case PRODUCT_ROUTE:
      displayProductDetails(response, query.id);
      break;
    case API_ROUTE:
      showJson(response);
      break;
    default:
      response.end("no such page");
      break;
  }
});

function displayAllProducts(response) {
  response.writeHead(200, { "Content-Type": "text/html" });
  const cardsHtml = jsonData
    .map((product) => replaceProductTemplate(templateProductCard, product))
    //We joined the list with new line to get html content without list square brackets []
    .join("\n");
  const output = templateOverview.replace(/{%PRODUCT_CARDS%}/g, cardsHtml);
  response.end(output);
}
function displayProductDetails(response, productId) {
  console.log(`currnt product id: ${productId}`);
  response.writeHead(200, { "Content-Type": "text/html" });
  const detailHtml = jsonData[productId];
  // console.log(detailHtml);
  const output = replaceProductTemplate(templateProduct, detailHtml);
  response.end(output);
}

function showJson(response) {
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(productData);
}

server.listen(8000, "127.0.0.1", () => {
  console.log("listening on 8000");
});

// fs.readFile("./starter/txt/input.txt", "utf8", (error, data) => {
//     console.log(data)
// });
