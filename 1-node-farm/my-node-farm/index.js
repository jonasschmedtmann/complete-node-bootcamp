const fs = require("fs"); // File System
const http = require("http"); // HTTP Handling

///////////////////////////////
// FILES

////////////////////////////////
// SERVER
const server = http.createServer((req, res) => {
  console.log(req);
  res.end("Hello from the server!");
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Listening on PORT 8000!");
});
