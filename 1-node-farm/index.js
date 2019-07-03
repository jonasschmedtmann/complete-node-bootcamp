const fs = require('fs')

const textInput = fs.readFileSync('./starter/txt/input.txt', 'utf-8')
console.log(textInput)

const textOutput = `this is what we know about the avocado: ${textInput}. \nCreated on ${Date.now()}`
fs.writeFileSync('./starter/txt/output.txt', textOutput)

console.log('File written')
