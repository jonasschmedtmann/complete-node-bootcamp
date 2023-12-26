/**
 * Advanced example using namespaces for a library and named arguments
 *
 * Run:
 *   node example4.js --help
 * and play with the options to see the behavior.
 */

var opts = require('./opts')
  , puts = require('util').puts
  , host = 'localhost'; // default host value

// Example of using some library in the same app
var libOpts = [
  { short       : 'l'
  , long        : 'list'
  , description : 'Show the library list'
  , callback    : function () { puts('mylib list!'); },
  },
];
opts.add(libOpts, 'mylib');

// NOTE: ------------
// You would never actually add options for a library from within your
// app, this would be done from within the library itself. It is shown
// here for readability

var options = [
  { short       : 'l' // deliberately conflicting with 'mylib' option
  , long        : 'list'
  , description : 'List all files'
  },
  { short       : 'd'
  , long        : 'debug'
  , description : 'Set a debug level'
  , value       : true
  },
];

var arguments = [ { name : 'script' , required : true }
                , { name : 'timeout' }
                ];

opts.parse(options, arguments, true);

var debug = opts.get('d') || 'info'  // default debug value
  , list  = opts.get('list');

var script  = opts.arg('script')
  , timeout = opts.arg('timeout') || 30;


if (list) puts('List arg was set');
puts('Debug level is: ' + debug);
puts('Script is: ' + script);
puts('Timeout is: ' + timeout);

process.exit(0);

