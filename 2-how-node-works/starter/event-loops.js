const fs = require("fs");
setTimeout(() => console.log("Timer 1 finished"), 1000);
setImmediate(() => console.log("Immidate finished"));

fs.readFile("test-file.txt", () => {
  console.log("I/O finished");
  console.log("----------------");
});

console.log("Top Level code finished");
