const fs = require("fs");
const hello = "hello world";
const textIn = fs.readFileSync("./txt/input.txt", "utf-8"); // readFileSync("./path","") takes two arguments, first one is reading file we want,second is character encoding
console.log(textIn);
const textOut = `About avocado ${textIn}.\n Created on ${Date.now()}`;
fs.writeFileSync("./txt/output.txt", textOut); // writeFileSync("./path","text") takes two arguments, first one  is the path to the file where the data will be written, second is the data that will be written to the file. if first data doesn't exist writeFileSync create a new file.
const readTextOut = fs.readFileSync("./txt/output.txt", "utf-8");
console.log(readTextOut);
