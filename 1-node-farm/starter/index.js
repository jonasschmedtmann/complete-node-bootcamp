const fs = require("fs");
const http = require("http");
const url = require("url");

// replaceTemplat is a custom module from the modules folder
const replaceTemplate = require("./modules/replaceTemplate");
////////////////////////////////////////
/// SERVER

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
  const { query, pathname } = url.parse(req.url, true);

  //  Overvew page
  if (pathname === "/" || pathname === "/overview") {
    res.writeHead(200, { "Content-type": "text/html" });

    const cardsHtml = dataObj
      .map(el => replaceTemplate(tempCard, el))
      .join(" ");
    const finalOutput = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHtml);
    console.log(finalOutput);
    res.end(finalOutput);
    //  Product page
  } else if (pathname === "/product") {
    res.writeHead(200, { "Content-type": "text/html" });

    // the product will select the query id of each product page it is on using the [] nodation e.g Array[0] or Array[4]
    const product = dataObj[query.id];

    const output = replaceTemplate(tempProduct, product);

    res.end(output);
  } else if (pathname === "/api") {
    //  API page
    res.writeHead(200, { "Content-type": "application/json" });

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
