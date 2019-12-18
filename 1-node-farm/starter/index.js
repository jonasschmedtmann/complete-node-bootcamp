const fs = require("fs");
const http = require("http");
const url = require("url");

////////////////////////////////////////
/// SERVER
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const dataObj = JSON.parse(data);

// Server Settings
const PORT = 9912;
const URL = "127.0.0.1";

// API call to the server
const server = http.createServer((req, res) => {
  const pathName = req.url;

  //
  if (pathName === "/" || pathName === "/overview") {
    res.end("overview page is active");
  } else if (pathName === "/products") {
    res.end("Product page is active");
  } else if (pathName === "/api") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(data);
  } else {
    res.writeHead(404, {
      "Content-type": "text/html",
      "Is-user-online": "fun"
    });
    res.end("<h1> Page not found </h1> ");
  }
});

server.listen(9912, URL, () => {
  console.log(`listing to requsert on port: http://${URL}:${PORT}`);
});

// You stoped 11
