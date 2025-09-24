const fs = require("fs");
const crypto = require("crypto");

const start = Date.now();

process.env.UV_THREADPOOL_SIZE = 4;

setTimeout(() => console.log("Timer 1 finished"), 0);
setImmediate(() => console.log("Immediate 1 finished"));

console.log("Hello from the top-level code");

fs.readFile("style.css", () => {
  console.log("I/O finished");

  console.log("--------------------");

  setTimeout(() => console.log("Timer 2 finished"), 0);
  setTimeout(() => console.log("Timer 3 finished"), 3000);

  setImmediate(() => console.log("Immediate 2 finished"));
  process.nextTick(() => console.log("Process.nextTick"));

  crypto.pbkdf2Sync("password", "salt", 100000, 1024, "sha512");
  console.log(`${Date.now() - start} - Password encrypted`);
  crypto.pbkdf2("password", "salt", 100000, 1024, "sha512", () => {
    console.log(`${Date.now() - start} - Password encrypted`);
  });
  crypto.pbkdf2("password", "salt", 100000, 1024, "sha512", () => {
    console.log(`${Date.now() - start} - Password encrypted`);
  });
});
 //////////////////////////////
 const EventEmitter = require("events");
const http = require("http");

// Custom EventEmitter class
class Sales extends EventEmitter {
  constructor() {
    super();
  }
}

const myEmitter = new EventEmitter();

myEmitter.on("newSales", () => {
  console.log("There was a sale");
});

myEmitter.on("newSales", () => {
  console.log("Customer");
});

myEmitter.on("newSales", (stock) => {
  console.log(`There are now ${stock} items left in stock.`);
});

myEmitter.emit("newSales", 9);
