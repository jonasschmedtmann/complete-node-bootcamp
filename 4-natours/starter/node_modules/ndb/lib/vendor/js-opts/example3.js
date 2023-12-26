/**
 * Simple example that is broken by design (conflicting options)
 *
 * Examples:
 *   $ node example3.js
 *   > Conflicting flags: -v
 */

var opts = require('./opts');

var options = [
  { short       : 'v'
  , description : 'Show version and exit'
  },
  { short       : 'v'
  , description : 'Be verbose'
  },
];

opts.parse(options);
puts('Example 3');
process.exit(0);


