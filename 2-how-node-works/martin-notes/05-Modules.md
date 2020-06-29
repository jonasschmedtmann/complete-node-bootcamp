# Modules

When requiring a module:

### Module path resolution
Node will search for modules in the order:
- Core modules
- Developer modules (if path includes **relative path**)
  - eg. `const Calculator = require('./test-module-1')`
- Looks for folders with an index.js
- node_modules

### Wrapping
Module code is wrapped in an IEFE function which give access to:
- exports, require, module, __dirname, __filename
- Modules have these like global vars:
```
(function exports, require, module, __filename,  __dirname ) {
  // Module code
}
```

### Execute
### Return exports
- `require` function returns **exports** of the required module
- `module.exports` is the returned object
- `module.exports` to export a single variable (eg module.exports = Calculator)
- `exports` to export multiple 'named' variables eg `exports.add = (a,b) => a + b`;

Modules are cached. Only executed and stored once on first call.

Logging `arguments` shows these parameters in an array from anywhere in the node app. All code is wrapped in this.
