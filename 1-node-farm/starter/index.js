const fs = require("fs")

const textIn = fs.readFileSync(".//txt//output.txt", "utf-8")
console.log(textIn)

const textOut = `nice feature for es6 like python ${textIn}.\nCreated on ${Date.now()}`;
fs.writeFileSync(".//txt//output.txt", textOut)