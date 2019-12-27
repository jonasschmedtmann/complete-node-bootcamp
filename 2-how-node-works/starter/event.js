// imported the eventEmitter + http
const EventEmitter = require("events");
const http = require("http");

// Here we extended the eventEmitter class
class Sales extends EventEmitter {
  constructor() {
    super();
  }
}

// Calling the new class that inherits FROM eventEmitter class
const myEmmiter = new Sales();

// The event.on is the listener
myEmmiter.on("newSale", () => {
  console.log("There was a new sale");
});

myEmmiter.on("newSale", () => {
  console.log("Username: Danjuma");
});

myEmmiter.on("newSale", stock => {
  console.log(`There are now ${stock} in our stock `);
});

myEmmiter.emit("newSale", 9);

//////////////////////////////////

const server = http.createServer();

server.on("request", (req, res) => {
  console.log("Request recived!");
  res.end("Request recived!");
});

server.on("request", (req, res) => {
  console.log("Request recived!");
  res.end("Anoter event recived!");
});

server.on("close", (req, res) => {
  console.log("Server closed!");
});

server.listen(9000, "127.0.0.1", () => {
  const serverAddress = "http://127.0.0.1:9000";
  console.log(`Waiting for request on ${serverAddress}`);
});
