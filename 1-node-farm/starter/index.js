const fs = require("fs");
const http = require("http");
const url = require("url");

////////////////////////////////////////
/// SERVER
const PORT = 9912;
const URL = "127.0.0.1";

const server = http.createServer((req, res) => {
  const pathName = req.url;

  if (pathName === "/" || pathName === "/overview") {
    res.end("overview page is active");
  } else if (pathName === "/products") {
    res.end("Product page is active");
  } else if (pathName === "/api") {
    console.log(`Director is:  ${__dirname}/dev-data/data.json`);
    fs.readFile(`${__dirname}/dev-data/data.json`, "utf-8", (err, data) => {
      const productData = JSON.parse(data);

      console.log(productData);
    });

    res.end("API");
  } else {
    res.writeHead(404, {
      "Content-type": "text/html",
      "Is-user-online": "fun"
    });
    res.end("<h1> Page not found </h1> ");
  }
});

server.listen(PORT, URL, () => {
  console.log(`listing to requsert on port: http://${URL}:${PORT}`);
});

// You stoped at 5:30 in video 10
