const fs = require('fs');
//fs stands for file system

const textIn = fs.readFileSync('./starter/txt/input.txt', 'utf-8');
//synchronous version of file reading, there is also asynchrous vesions
console.log(textIn)

// const hello = "Hello world";
// console.log(hello);

const textOut = ``