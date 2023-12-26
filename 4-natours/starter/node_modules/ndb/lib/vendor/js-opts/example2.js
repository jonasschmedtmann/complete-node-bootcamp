/**
 * More complex example.
 *
 * Run:
 *   node example2.js --help
 * and play with the options to see the behavior.
 *
 * This example shows different ways of using the library. It is deliberately 
 * inconsistent. Choose the style that suits you best.
 */

var opts = require('./opts')
  , puts = require('util').puts
  , host = 'localhost'; // default host value

var options = [
  { short       : 'v'
  , long        : 'version'
  , description : 'Show version and exit'
  , callback    : function () { puts('v1.0'); process.exit(1); }
  },
  { short       : 'l'
  , long        : 'list'
  , description : 'List all files'
  },
  { short       : 'f'
  , long        : 'file'
  , description : 'Load a file'
  , value       : true
  , required    : true
  },
  { short       : 'd'
  , long        : 'debug'
  , description : 'Set a debug level'
  , value       : true
  },
  { short       : 'h'
  , long        : 'host'
  , description : 'The hostname to connect to'
  , value       : true
  , callback    : function (value) { host = value; } // override host value
  },
  { short       : 'p'
  , long        : 'port'
  , description : 'The port to connect to'
  , value       : true
  },
];

opts.parse(options, true);

var port  = opts.get('port') || 8000 // default port value
  , debug = opts.get('d') || 'info'  // default debug value
  , file  = opts.get('f')
  , list  = opts.get('list');

var arg1 = opts.args()[0]
  , arg2 = opts.args()[1];


if (list) puts('List arg was set');
if (file) puts('File arg was set: ' + file);
puts('Debug level is: ' + debug);
puts('Host is: ' + host);
puts('Port is: ' + port);

if (arg1) puts('Extra arg 1: ' + arg1);
if (arg2) puts('Extra arg 2: ' + arg2);

process.exit(0);

