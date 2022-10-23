// console.log(arguments);
// console.log(require("modeul").wrapper);

//module.exports
const C = require('./test-module-1');
const calc1 = new C();
console.log(calc1.add(4, 8));

// exports
//const calc2 = new require('./test-module-2');
//console.log(calc2.add(4, 8));

//object ES6^ destructuring
const  {add, minus, multiply, divide} = new require('./test-module-2');
console.log(multiply(4, 8));

//caching
require('./test-module-3')();
require('./test-module-3')();
require('./test-module-3')();