const fs = require("fs");

const textIn = fs.readFileSync("./txt/input.txt", "utf-8");
// console.log(textIn);

const textOut = `Hello, let me tell you all about the avocado! ${textIn}`;
fs.writeFileSync("./txt/output.txt", textOut);
console.log("File was written!");
