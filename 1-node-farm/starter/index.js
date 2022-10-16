const fs = require('fs');

//blocking code execution
const textIN = fs.readFileSync('./txt/input.txt', 'utf-8');
console.log(textIN);

const textOut = `This is what we know about the avacado 🥑: ${textIN}.\nCreated on ${Date.now()}`;
fs.writeFileSync('./txt/output.txt', textOut);
console.log('File Written');