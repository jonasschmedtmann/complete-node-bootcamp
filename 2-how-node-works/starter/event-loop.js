const EventEmitter = require("events");
const http = require("http");
class Sales extends EventEmitter {
  constructor() {
    super();
  }
}

const myEmitter = new EventEmitter();

myEmitter.on("newSales", () => {
  console.log("There as a slae");
});

myEmitter.on("newSales", () => {
  console.log("Costumere");
});

myEmitter.on("newSales", (stock) => {
  console.log(`There aer now ${stock} items left in stock.`);
});

myEmitter.emit("newSales", 9);

////////////////////

const server = http.createServer();

server.on("request", (req, res) => {
  console.log("Request revievd");
  console.log(req.url);
  res.end("Request received");
});

server.on("request", (req, res) => {
  console.log("Another requst 😊");
});
server.on("close", () => {
  console.log("Server closed");
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Waiting for requesetes...");
});
