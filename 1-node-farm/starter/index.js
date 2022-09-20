// Imports fs module from node
const fs = require('fs') 

const textIn = fs.readFileSync('./txt/input.txt', 'utf-8') ;
//reads a specified file, two paramters are filepath and datatype being read, can be saved to a variable


const textOut = `This is what we know about the avocado: ${textIn}.\nCreated on ${Date.now()}` //variable using our textIn variable

fs.writeFileSync('./txt/output.txt', textOut);
//writes a file out, need filepath and filename, and what is being written for second parameter

//---------------------------------------------------SYNCHRONOUS CODE