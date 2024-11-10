// console.log(arguments);

const C = require("./test-module1");
const c2 = require("./test-module2");

const c1 = new C();

// console.log(c2.add(5, 5));

require("./test-module3")();
require("./test-module3")();
require("./test-module3")();
