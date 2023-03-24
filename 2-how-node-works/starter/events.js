const eventEmitter = require("events");
const http = require("http");

//http, fs inherit their methods from the eventEmmiter
class Sales extends eventEmitter {
  constructor() {
    super();
  }
}

const myEmitter = new Sales();

//Observers (emit event) Event listener - we can set up multiple listeners for the same event
myEmitter.on("newSale", () => {
  console.log("There was a new sale!");
});

myEmitter.on("newSale", () => {
  console.log("Costumer name: Ângela");
});

//stock is the argument passed in the emiter
myEmitter.on("newSale", (stock) => {
  console.log(`There are now ${stock} items left in stock`);
});

//Object that emits the event, you can had arguments that can be used in the observers
myEmitter.emit("newSale", 9);

//////////////////////

const server = http.createServer();

server.on("request", (req, res) => {
  console.log("Request received");
  res.end("Request received");
});

server.on("request", (req, res) => {
  console.log("Another request");
});

server.on("close", (req, res) => {
  console.log("Server closed");
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Waiting for requests...");
});
