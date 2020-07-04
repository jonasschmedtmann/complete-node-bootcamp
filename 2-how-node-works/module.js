// module.exports
const C = require('./test-module1');
const calc1 = new C();
console.log(calc1.add(2,5));

console.log('------------------------------------------------------------------------')

//exports
const calc2 = require("./test-module2");
console.log(calc2.add(2, 5));
console.log(calc2.multiply(2, 7));

// OR   exports
const { add, multiply, divide, subtract } = require("./test-module2");
console.log(add(6, 5));
console.log(multiply(9, 7));

// caching
require('./test-module3')();
require('./test-module3')();
require('./test-module3')();


// console.log(arguments);
// /*[Arguments] {
//     '0': {},
//     '1': [Function: require] {
//       resolve: [Function: resolve] { paths: [Function: paths] },
//       main: Module {
//         id: '.',
//         path: '/Users/matthewmalecki/Development/complete-node-bootcamp/2-how-node-works',
//         exports: {},
//         parent: null,
//         filename: '/Users/matthewmalecki/Development/complete-node-bootcamp/2-how-node-works/modules.js',
//         loaded: false,
//         children: [],
//         paths: [Array]
//       },
//       extensions: [Object: null prototype] {
//         '.js': [Function (anonymous)],
//         '.json': [Function (anonymous)],
//         '.node': [Function (anonymous)]
//       },
//       cache: [Object: null prototype] {
//         '/Users/matthewmalecki/Development/complete-node-bootcamp/2-how-node-works/modules.js': [Module]
//       }
//     },
//     '2': Module {
//       id: '.',
//       path: '/Users/matthewmalecki/Development/complete-node-bootcamp/2-how-node-works',
//       exports: {},
//       parent: null,
//       filename: '/Users/matthewmalecki/Development/complete-node-bootcamp/2-how-node-works/modules.js',
//       loaded: false,
//       children: [],
//       paths: [
//         '/Users/matthewmalecki/Development/complete-node-bootcamp/2-how-node-works/node_modules',
//         '/Users/matthewmalecki/Development/complete-node-bootcamp/node_modules',
//         '/Users/matthewmalecki/Development/node_modules',
//         '/Users/matthewmalecki/node_modules',
//         '/Users/node_modules',
//         '/node_modules'
//       ]
//     },
//     '3': '/Users/matthewmalecki/Development/complete-node-bootcamp/2-how-node-works/modules.js',
//     '4': '/Users/matthewmalecki/Development/complete-node-bootcamp/2-how-node-works' */

// console.log(require('module').wrapper);
//     /* [
//   '(function (exports, require, module, __filename, __dirname) { ',
//   '\n});'
// ]  */

