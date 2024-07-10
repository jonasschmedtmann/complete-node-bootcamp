const EventEmitter = require("events");
const http = require("http");

class Sale extends EventEmitter {
  constructor() {
    super();
  }
}
const eventEmitter = new Sale();

eventEmitter.on("newSale", () => {
  console.log("New Sale -------");
});

eventEmitter.on("newSale", () => {
  console.log("Customer Name: AWAD");
});

eventEmitter.on("newSale", (stock) => {
  console.log(`Items Available: ${stock}`);
});

eventEmitter.emit("newSale", 8);
///////////////////

const server = http.createServer();
server.on("request", (req, res) => {
  console.log("Request Received 😊");
  res.end("Welcome");
});
