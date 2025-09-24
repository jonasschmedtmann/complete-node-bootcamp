// console.log(arguments);
// console.log(require("module").wrapper);

// module.export
const C = require("./test-module-1");
const clac1 = new C();
console.log(clac1.add(4, 6));

//export
// const calc2 = require("./text-module-2");
const { add, multiply } = require("./test_module-2");
console.log(multiply(2, 5));

//caching
require("./test_module-3")();
require("./test_module-3")();
require("./test_module-3")();
