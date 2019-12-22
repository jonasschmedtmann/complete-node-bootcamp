const fs = require("fs");
const http = require("http");
const url = require("url");

////////////////////////////////////////
/// SERVER

const replaceTemplate = (temp, product) => {
  let output = temp.replace(/%{PRODUCTNAME}%/g, product);
  output = output.replace(/%{IMAGE}%/g, product.image);
  output = output.replace(/%{FROM}%/g, product.from);
  output = output.replace(/%{NUTRIENTS}%/g, product.nutrients);
  output = output.replace(/%{QUANTITY}%/g, product.quantity);
  output = output.replace(/%{PRICE}%/g, product.price);
  output = output.replace(/%{DESCRIPTION}%/g, product.description);
  output = output.replace(/%{ID}%/, product.id);

  if (!product.organic)
    output = output.replace(/%{NOT_ORGANIC}%/g, "not-organic");
  return output;
};

const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  "utf-8"
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8"
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  "utf-8"
);

// This will get the content in json in the file or server
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
// This will trurn the string from the json server or file and turns it into JavaScript
const dataObj = JSON.parse(data);

const server = http.createServer((req, res) => {
  const pathName = req.url;

  //  Overvew page
  if (pathName === "/" || pathName === "/overview") {
    res.writeHead(200, { "content-type": "text/html" });

    const cardsHtml = dataObj
      .map(el => replaceTemplate(tempCard, el))
      .join(" ");
    const finalOutput = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHtml);
    console.log(finalOutput);
    res.end(finalOutput);
    //  Product page
  } else if (pathName === "/products") {
    res.end("Product page is active");
  } else if (pathName === "/api") {
    //  API page
    res.writeHead(200, { "content-type": "application/json" });
    res.end(data);
  } else {
    // Error Page / Not found
    res.writeHead(404, {
      "Content-type": "text/html",
      "Is-user-online": "fun"
    });
    res.end("<h1> Page not found </h1> ");
  }
});

/*
Use this setting to set the Server URL and PORT 📌
*/
const PORT = 7646;
const URL = "127.0.0.1";
/*
Setting is above this line ☝️
*/
server.listen(PORT, URL, () => {
  console.log(`listing to requsert on port: http://${URL}:${PORT}`);
});

// You stoped 11 fix the bug not relacing placeholder
