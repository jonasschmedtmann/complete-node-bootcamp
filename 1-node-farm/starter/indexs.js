const fs = require('fs');

const text = fs.readFileSync('./txt/input.txt', 'utf-8');
console.log(text)

const wite = `this is about avocado ${text}\n Created at ${Date.now()}`
fs.writeFileSync('./txt/output.txt', wite)
console.log('FilenWirtten ')