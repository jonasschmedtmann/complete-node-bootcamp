// Module.export
const Calc = require("./test-module-1");
const cal1 = new Calc();
console.log(cal1.add(3, 4));

// Using export

// const cal2 = require("./test-module-2");
const { add, multipy, divide } = require("./test-module-2");
console.log(divide(4, 3));
console.log(add(4, 3));

/// Caching
require("./test-module-3")();
require("./test-module-3")();
require("./test-module-3")();
