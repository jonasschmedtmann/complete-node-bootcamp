'use strict';

var _ExportMap = require('../ExportMap');

var _ExportMap2 = _interopRequireDefault(_ExportMap);

var _resolve = require('eslint-module-utils/resolve');

var _resolve2 = _interopRequireDefault(_resolve);

var _docsUrl = require('../docsUrl');

var _docsUrl2 = _interopRequireDefault(_docsUrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } } /**
                                                                                                                                                                                                 * @fileOverview Ensures that modules contain exports and/or all 
                                                                                                                                                                                                 * modules are consumed within other modules.
                                                                                                                                                                                                 * @author René Fermann
                                                                                                                                                                                                 */

// eslint/lib/util/glob-util has been moved to eslint/lib/util/glob-utils with version 5.3
let listFilesToProcess;
try {
  listFilesToProcess = require('eslint/lib/util/glob-utils').listFilesToProcess;
} catch (err) {
  listFilesToProcess = require('eslint/lib/util/glob-util').listFilesToProcess;
}

const EXPORT_DEFAULT_DECLARATION = 'ExportDefaultDeclaration';
const EXPORT_NAMED_DECLARATION = 'ExportNamedDeclaration';
const EXPORT_ALL_DECLARATION = 'ExportAllDeclaration';
const IMPORT_DECLARATION = 'ImportDeclaration';
const IMPORT_NAMESPACE_SPECIFIER = 'ImportNamespaceSpecifier';
const IMPORT_DEFAULT_SPECIFIER = 'ImportDefaultSpecifier';
const VARIABLE_DECLARATION = 'VariableDeclaration';
const FUNCTION_DECLARATION = 'FunctionDeclaration';
const DEFAULT = 'default';

let preparationDone = false;
const importList = new Map();
const exportList = new Map();
const ignoredFiles = new Set();

const isNodeModule = path => {
  return (/\/(node_modules)\//.test(path)
  );
};

/**
 * read all files matching the patterns in src and ignoreExports
 * 
 * return all files matching src pattern, which are not matching the ignoreExports pattern
 */
const resolveFiles = (src, ignoreExports) => {
  const srcFiles = new Set();
  const srcFileList = listFilesToProcess(src);

  // prepare list of ignored files
  const ignoredFilesList = listFilesToProcess(ignoreExports);
  ignoredFilesList.forEach((_ref) => {
    let filename = _ref.filename;
    return ignoredFiles.add(filename);
  });

  // prepare list of source files, don't consider files from node_modules
  srcFileList.filter((_ref2) => {
    let filename = _ref2.filename;
    return !isNodeModule(filename);
  }).forEach((_ref3) => {
    let filename = _ref3.filename;

    srcFiles.add(filename);
  });
  return srcFiles;
};

/**
 * parse all source files and build up 2 maps containing the existing imports and exports
 */
const prepareImportsAndExports = (srcFiles, context) => {
  const exportAll = new Map();
  srcFiles.forEach(file => {
    const exports = new Map();
    const imports = new Map();
    const currentExports = _ExportMap2.default.get(file, context);
    if (currentExports) {
      const dependencies = currentExports.dependencies,
            reexports = currentExports.reexports,
            localImportList = currentExports.imports,
            namespace = currentExports.namespace;

      // dependencies === export * from 

      const currentExportAll = new Set();
      dependencies.forEach(value => {
        currentExportAll.add(value().path);
      });
      exportAll.set(file, currentExportAll);

      reexports.forEach((value, key) => {
        if (key === DEFAULT) {
          exports.set(IMPORT_DEFAULT_SPECIFIER, { whereUsed: new Set() });
        } else {
          exports.set(key, { whereUsed: new Set() });
        }
        const reexport = value.getImport();
        if (!reexport) {
          return;
        }
        let localImport = imports.get(reexport.path);
        let currentValue;
        if (value.local === DEFAULT) {
          currentValue = IMPORT_DEFAULT_SPECIFIER;
        } else {
          currentValue = value.local;
        }
        if (typeof localImport !== 'undefined') {
          localImport = new Set([].concat(_toConsumableArray(localImport), [currentValue]));
        } else {
          localImport = new Set([currentValue]);
        }
        imports.set(reexport.path, localImport);
      });

      localImportList.forEach((value, key) => {
        if (isNodeModule(key)) {
          return;
        }
        imports.set(key, value.importedSpecifiers);
      });
      importList.set(file, imports);

      // build up export list only, if file is not ignored
      if (ignoredFiles.has(file)) {
        return;
      }
      namespace.forEach((value, key) => {
        if (key === DEFAULT) {
          exports.set(IMPORT_DEFAULT_SPECIFIER, { whereUsed: new Set() });
        } else {
          exports.set(key, { whereUsed: new Set() });
        }
      });
    }
    exports.set(EXPORT_ALL_DECLARATION, { whereUsed: new Set() });
    exports.set(IMPORT_NAMESPACE_SPECIFIER, { whereUsed: new Set() });
    exportList.set(file, exports);
  });
  exportAll.forEach((value, key) => {
    value.forEach(val => {
      const currentExports = exportList.get(val);
      const currentExport = currentExports.get(EXPORT_ALL_DECLARATION);
      currentExport.whereUsed.add(key);
    });
  });
};

/**
 * traverse through all imports and add the respective path to the whereUsed-list 
 * of the corresponding export
 */
const determineUsage = () => {
  importList.forEach((listValue, listKey) => {
    listValue.forEach((value, key) => {
      const exports = exportList.get(key);
      if (typeof exports !== 'undefined') {
        value.forEach(currentImport => {
          let specifier;
          if (currentImport === IMPORT_NAMESPACE_SPECIFIER) {
            specifier = IMPORT_NAMESPACE_SPECIFIER;
          } else if (currentImport === IMPORT_DEFAULT_SPECIFIER) {
            specifier = IMPORT_DEFAULT_SPECIFIER;
          } else {
            specifier = currentImport;
          }
          if (typeof specifier !== 'undefined') {
            const exportStatement = exports.get(specifier);
            if (typeof exportStatement !== 'undefined') {
              const whereUsed = exportStatement.whereUsed;

              whereUsed.add(listKey);
              exports.set(specifier, { whereUsed });
            }
          }
        });
      }
    });
  });
};

const getSrc = src => {
  if (src) {
    return src;
  }
  return [process.cwd()];
};

/**
 * prepare the lists of existing imports and exports - should only be executed once at
 * the start of a new eslint run
 */
const doPreparation = (src, ignoreExports, context) => {
  const srcFiles = resolveFiles(getSrc(src), ignoreExports);
  prepareImportsAndExports(srcFiles, context);
  determineUsage();
  preparationDone = true;
};

const newNamespaceImportExists = specifiers => specifiers.some((_ref4) => {
  let type = _ref4.type;
  return type === IMPORT_NAMESPACE_SPECIFIER;
});

const newDefaultImportExists = specifiers => specifiers.some((_ref5) => {
  let type = _ref5.type;
  return type === IMPORT_DEFAULT_SPECIFIER;
});

module.exports = {
  meta: {
    docs: { url: (0, _docsUrl2.default)('no-unused-modules') },
    schema: [{
      properties: {
        src: {
          description: 'files/paths to be analyzed (only for unused exports)',
          type: 'array',
          minItems: 1,
          items: {
            type: 'string',
            minLength: 1
          }
        },
        ignoreExports: {
          description: 'files/paths for which unused exports will not be reported (e.g module entry points)',
          type: 'array',
          minItems: 1,
          items: {
            type: 'string',
            minLength: 1
          }
        },
        missingExports: {
          description: 'report modules without any exports',
          type: 'boolean'
        },
        unusedExports: {
          description: 'report exports without any usage',
          type: 'boolean'
        }
      },
      not: {
        properties: {
          unusedExports: { enum: [false] },
          missingExports: { enum: [false] }
        }
      },
      anyOf: [{
        not: {
          properties: {
            unusedExports: { enum: [true] }
          }
        },
        required: ['missingExports']
      }, {
        not: {
          properties: {
            missingExports: { enum: [true] }
          }
        },
        required: ['unusedExports']
      }, {
        properties: {
          unusedExports: { enum: [true] }
        },
        required: ['unusedExports']
      }, {
        properties: {
          missingExports: { enum: [true] }
        },
        required: ['missingExports']
      }]
    }]
  },

  create: context => {
    var _ref6 = context.options[0] || {};

    const src = _ref6.src;
    var _ref6$ignoreExports = _ref6.ignoreExports;
    const ignoreExports = _ref6$ignoreExports === undefined ? [] : _ref6$ignoreExports,
          missingExports = _ref6.missingExports,
          unusedExports = _ref6.unusedExports;


    if (unusedExports && !preparationDone) {
      doPreparation(src, ignoreExports, context);
    }

    const file = context.getFilename();

    const checkExportPresence = node => {
      if (!missingExports) {
        return;
      }

      if (ignoredFiles.has(file)) {
        return;
      }

      const exportCount = exportList.get(file);
      const exportAll = exportCount.get(EXPORT_ALL_DECLARATION);
      const namespaceImports = exportCount.get(IMPORT_NAMESPACE_SPECIFIER);

      exportCount.delete(EXPORT_ALL_DECLARATION);
      exportCount.delete(IMPORT_NAMESPACE_SPECIFIER);
      if (missingExports && exportCount.size < 1) {
        // node.body[0] === 'undefined' only happens, if everything is commented out in the file
        // being linted
        context.report(node.body[0] ? node.body[0] : node, 'No exports found');
      }
      exportCount.set(EXPORT_ALL_DECLARATION, exportAll);
      exportCount.set(IMPORT_NAMESPACE_SPECIFIER, namespaceImports);
    };

    const checkUsage = (node, exportedValue) => {
      if (!unusedExports) {
        return;
      }

      if (ignoredFiles.has(file)) {
        return;
      }

      exports = exportList.get(file);

      // special case: export * from 
      const exportAll = exports.get(EXPORT_ALL_DECLARATION);
      if (typeof exportAll !== 'undefined' && exportedValue !== IMPORT_DEFAULT_SPECIFIER) {
        if (exportAll.whereUsed.size > 0) {
          return;
        }
      }

      // special case: namespace import
      const namespaceImports = exports.get(IMPORT_NAMESPACE_SPECIFIER);
      if (typeof namespaceImports !== 'undefined') {
        if (namespaceImports.whereUsed.size > 0) {
          return;
        }
      }

      const exportStatement = exports.get(exportedValue);

      const value = exportedValue === IMPORT_DEFAULT_SPECIFIER ? DEFAULT : exportedValue;

      if (typeof exportStatement !== 'undefined') {
        if (exportStatement.whereUsed.size < 1) {
          context.report(node, `exported declaration '${value}' not used within other modules`);
        }
      } else {
        context.report(node, `exported declaration '${value}' not used within other modules`);
      }
    };

    /**
     * only useful for tools like vscode-eslint
     * 
     * update lists of existing exports during runtime
     */
    const updateExportUsage = node => {
      if (ignoredFiles.has(file)) {
        return;
      }

      let exports = exportList.get(file);

      // new module has been created during runtime
      // include it in further processing
      if (typeof exports === 'undefined') {
        exports = new Map();
      }

      const newExports = new Map();
      const newExportIdentifiers = new Set();

      node.body.forEach((_ref7) => {
        let type = _ref7.type,
            declaration = _ref7.declaration,
            specifiers = _ref7.specifiers;

        if (type === EXPORT_DEFAULT_DECLARATION) {
          newExportIdentifiers.add(IMPORT_DEFAULT_SPECIFIER);
        }
        if (type === EXPORT_NAMED_DECLARATION) {
          if (specifiers.length > 0) {
            specifiers.forEach(specifier => {
              if (specifier.exported) {
                newExportIdentifiers.add(specifier.exported.name);
              }
            });
          }
          if (declaration) {
            if (declaration.type === FUNCTION_DECLARATION) {
              newExportIdentifiers.add(declaration.id.name);
            }
            if (declaration.type === VARIABLE_DECLARATION) {
              declaration.declarations.forEach((_ref8) => {
                let id = _ref8.id;

                newExportIdentifiers.add(id.name);
              });
            }
          }
        }
      });

      // old exports exist within list of new exports identifiers: add to map of new exports
      exports.forEach((value, key) => {
        if (newExportIdentifiers.has(key)) {
          newExports.set(key, value);
        }
      });

      // new export identifiers added: add to map of new exports
      newExportIdentifiers.forEach(key => {
        if (!exports.has(key)) {
          newExports.set(key, { whereUsed: new Set() });
        }
      });

      // preserve information about namespace imports
      let exportAll = exports.get(EXPORT_ALL_DECLARATION);
      let namespaceImports = exports.get(IMPORT_NAMESPACE_SPECIFIER);

      if (typeof namespaceImports === 'undefined') {
        namespaceImports = { whereUsed: new Set() };
      }

      newExports.set(EXPORT_ALL_DECLARATION, exportAll);
      newExports.set(IMPORT_NAMESPACE_SPECIFIER, namespaceImports);
      exportList.set(file, newExports);
    };

    /**
     * only useful for tools like vscode-eslint
     * 
     * update lists of existing imports during runtime
     */
    const updateImportUsage = node => {
      if (!unusedExports) {
        return;
      }

      let oldImportPaths = importList.get(file);
      if (typeof oldImportPaths === 'undefined') {
        oldImportPaths = new Map();
      }

      const oldNamespaceImports = new Set();
      const newNamespaceImports = new Set();

      const oldExportAll = new Set();
      const newExportAll = new Set();

      const oldDefaultImports = new Set();
      const newDefaultImports = new Set();

      const oldImports = new Map();
      const newImports = new Map();
      oldImportPaths.forEach((value, key) => {
        if (value.has(EXPORT_ALL_DECLARATION)) {
          oldExportAll.add(key);
        }
        if (value.has(IMPORT_NAMESPACE_SPECIFIER)) {
          oldNamespaceImports.add(key);
        }
        if (value.has(IMPORT_DEFAULT_SPECIFIER)) {
          oldDefaultImports.add(key);
        }
        value.forEach(val => {
          if (val !== IMPORT_NAMESPACE_SPECIFIER && val !== IMPORT_DEFAULT_SPECIFIER) {
            oldImports.set(val, key);
          }
        });
      });

      node.body.forEach(astNode => {
        let resolvedPath;

        // support for export { value } from 'module'
        if (astNode.type === EXPORT_NAMED_DECLARATION) {
          if (astNode.source) {
            resolvedPath = (0, _resolve2.default)(astNode.source.value, context);
            astNode.specifiers.forEach(specifier => {
              let name;
              if (specifier.exported.name === DEFAULT) {
                name = IMPORT_DEFAULT_SPECIFIER;
              } else {
                name = specifier.local.name;
              }
              newImports.set(name, resolvedPath);
            });
          }
        }

        if (astNode.type === EXPORT_ALL_DECLARATION) {
          resolvedPath = (0, _resolve2.default)(astNode.source.value, context);
          newExportAll.add(resolvedPath);
        }

        if (astNode.type === IMPORT_DECLARATION) {
          resolvedPath = (0, _resolve2.default)(astNode.source.value, context);
          if (!resolvedPath) {
            return;
          }

          if (isNodeModule(resolvedPath)) {
            return;
          }

          if (newNamespaceImportExists(astNode.specifiers)) {
            newNamespaceImports.add(resolvedPath);
          }

          if (newDefaultImportExists(astNode.specifiers)) {
            newDefaultImports.add(resolvedPath);
          }

          astNode.specifiers.forEach(specifier => {
            if (specifier.type === IMPORT_DEFAULT_SPECIFIER || specifier.type === IMPORT_NAMESPACE_SPECIFIER) {
              return;
            }
            newImports.set(specifier.local.name, resolvedPath);
          });
        }
      });

      newExportAll.forEach(value => {
        if (!oldExportAll.has(value)) {
          let imports = oldImportPaths.get(value);
          if (typeof imports === 'undefined') {
            imports = new Set();
          }
          imports.add(EXPORT_ALL_DECLARATION);
          oldImportPaths.set(value, imports);

          let exports = exportList.get(value);
          let currentExport;
          if (typeof exports !== 'undefined') {
            currentExport = exports.get(EXPORT_ALL_DECLARATION);
          } else {
            exports = new Map();
            exportList.set(value, exports);
          }

          if (typeof currentExport !== 'undefined') {
            currentExport.whereUsed.add(file);
          } else {
            const whereUsed = new Set();
            whereUsed.add(file);
            exports.set(EXPORT_ALL_DECLARATION, { whereUsed });
          }
        }
      });

      oldExportAll.forEach(value => {
        if (!newExportAll.has(value)) {
          const imports = oldImportPaths.get(value);
          imports.delete(EXPORT_ALL_DECLARATION);

          const exports = exportList.get(value);
          if (typeof exports !== 'undefined') {
            const currentExport = exports.get(EXPORT_ALL_DECLARATION);
            if (typeof currentExport !== 'undefined') {
              currentExport.whereUsed.delete(file);
            }
          }
        }
      });

      newDefaultImports.forEach(value => {
        if (!oldDefaultImports.has(value)) {
          let imports = oldImportPaths.get(value);
          if (typeof imports === 'undefined') {
            imports = new Set();
          }
          imports.add(IMPORT_DEFAULT_SPECIFIER);
          oldImportPaths.set(value, imports);

          let exports = exportList.get(value);
          let currentExport;
          if (typeof exports !== 'undefined') {
            currentExport = exports.get(IMPORT_DEFAULT_SPECIFIER);
          } else {
            exports = new Map();
            exportList.set(value, exports);
          }

          if (typeof currentExport !== 'undefined') {
            currentExport.whereUsed.add(file);
          } else {
            const whereUsed = new Set();
            whereUsed.add(file);
            exports.set(IMPORT_DEFAULT_SPECIFIER, { whereUsed });
          }
        }
      });

      oldDefaultImports.forEach(value => {
        if (!newDefaultImports.has(value)) {
          const imports = oldImportPaths.get(value);
          imports.delete(IMPORT_DEFAULT_SPECIFIER);

          const exports = exportList.get(value);
          if (typeof exports !== 'undefined') {
            const currentExport = exports.get(IMPORT_DEFAULT_SPECIFIER);
            if (typeof currentExport !== 'undefined') {
              currentExport.whereUsed.delete(file);
            }
          }
        }
      });

      newNamespaceImports.forEach(value => {
        if (!oldNamespaceImports.has(value)) {
          let imports = oldImportPaths.get(value);
          if (typeof imports === 'undefined') {
            imports = new Set();
          }
          imports.add(IMPORT_NAMESPACE_SPECIFIER);
          oldImportPaths.set(value, imports);

          let exports = exportList.get(value);
          let currentExport;
          if (typeof exports !== 'undefined') {
            currentExport = exports.get(IMPORT_NAMESPACE_SPECIFIER);
          } else {
            exports = new Map();
            exportList.set(value, exports);
          }

          if (typeof currentExport !== 'undefined') {
            currentExport.whereUsed.add(file);
          } else {
            const whereUsed = new Set();
            whereUsed.add(file);
            exports.set(IMPORT_NAMESPACE_SPECIFIER, { whereUsed });
          }
        }
      });

      oldNamespaceImports.forEach(value => {
        if (!newNamespaceImports.has(value)) {
          const imports = oldImportPaths.get(value);
          imports.delete(IMPORT_NAMESPACE_SPECIFIER);

          const exports = exportList.get(value);
          if (typeof exports !== 'undefined') {
            const currentExport = exports.get(IMPORT_NAMESPACE_SPECIFIER);
            if (typeof currentExport !== 'undefined') {
              currentExport.whereUsed.delete(file);
            }
          }
        }
      });

      newImports.forEach((value, key) => {
        if (!oldImports.has(key)) {
          let imports = oldImportPaths.get(value);
          if (typeof imports === 'undefined') {
            imports = new Set();
          }
          imports.add(key);
          oldImportPaths.set(value, imports);

          let exports = exportList.get(value);
          let currentExport;
          if (typeof exports !== 'undefined') {
            currentExport = exports.get(key);
          } else {
            exports = new Map();
            exportList.set(value, exports);
          }

          if (typeof currentExport !== 'undefined') {
            currentExport.whereUsed.add(file);
          } else {
            const whereUsed = new Set();
            whereUsed.add(file);
            exports.set(key, { whereUsed });
          }
        }
      });

      oldImports.forEach((value, key) => {
        if (!newImports.has(key)) {
          const imports = oldImportPaths.get(value);
          imports.delete(key);

          const exports = exportList.get(value);
          if (typeof exports !== 'undefined') {
            const currentExport = exports.get(key);
            if (typeof currentExport !== 'undefined') {
              currentExport.whereUsed.delete(file);
            }
          }
        }
      });
    };

    return {
      'Program:exit': node => {
        updateExportUsage(node);
        updateImportUsage(node);
        checkExportPresence(node);
      },
      'ExportDefaultDeclaration': node => {
        checkUsage(node, IMPORT_DEFAULT_SPECIFIER);
      },
      'ExportNamedDeclaration': node => {
        node.specifiers.forEach(specifier => {
          checkUsage(node, specifier.exported.name);
        });
        if (node.declaration) {
          if (node.declaration.type === FUNCTION_DECLARATION) {
            checkUsage(node, node.declaration.id.name);
          }
          if (node.declaration.type === VARIABLE_DECLARATION) {
            node.declaration.declarations.forEach(declaration => {
              checkUsage(node, declaration.id.name);
            });
          }
        }
      }
    };
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJ1bGVzL25vLXVudXNlZC1tb2R1bGVzLmpzIl0sIm5hbWVzIjpbImxpc3RGaWxlc1RvUHJvY2VzcyIsInJlcXVpcmUiLCJlcnIiLCJFWFBPUlRfREVGQVVMVF9ERUNMQVJBVElPTiIsIkVYUE9SVF9OQU1FRF9ERUNMQVJBVElPTiIsIkVYUE9SVF9BTExfREVDTEFSQVRJT04iLCJJTVBPUlRfREVDTEFSQVRJT04iLCJJTVBPUlRfTkFNRVNQQUNFX1NQRUNJRklFUiIsIklNUE9SVF9ERUZBVUxUX1NQRUNJRklFUiIsIlZBUklBQkxFX0RFQ0xBUkFUSU9OIiwiRlVOQ1RJT05fREVDTEFSQVRJT04iLCJERUZBVUxUIiwicHJlcGFyYXRpb25Eb25lIiwiaW1wb3J0TGlzdCIsIk1hcCIsImV4cG9ydExpc3QiLCJpZ25vcmVkRmlsZXMiLCJTZXQiLCJpc05vZGVNb2R1bGUiLCJwYXRoIiwidGVzdCIsInJlc29sdmVGaWxlcyIsInNyYyIsImlnbm9yZUV4cG9ydHMiLCJzcmNGaWxlcyIsInNyY0ZpbGVMaXN0IiwiaWdub3JlZEZpbGVzTGlzdCIsImZvckVhY2giLCJmaWxlbmFtZSIsImFkZCIsImZpbHRlciIsInByZXBhcmVJbXBvcnRzQW5kRXhwb3J0cyIsImNvbnRleHQiLCJleHBvcnRBbGwiLCJmaWxlIiwiZXhwb3J0cyIsImltcG9ydHMiLCJjdXJyZW50RXhwb3J0cyIsIkV4cG9ydHMiLCJnZXQiLCJkZXBlbmRlbmNpZXMiLCJyZWV4cG9ydHMiLCJsb2NhbEltcG9ydExpc3QiLCJuYW1lc3BhY2UiLCJjdXJyZW50RXhwb3J0QWxsIiwidmFsdWUiLCJzZXQiLCJrZXkiLCJ3aGVyZVVzZWQiLCJyZWV4cG9ydCIsImdldEltcG9ydCIsImxvY2FsSW1wb3J0IiwiY3VycmVudFZhbHVlIiwibG9jYWwiLCJpbXBvcnRlZFNwZWNpZmllcnMiLCJoYXMiLCJ2YWwiLCJjdXJyZW50RXhwb3J0IiwiZGV0ZXJtaW5lVXNhZ2UiLCJsaXN0VmFsdWUiLCJsaXN0S2V5IiwiY3VycmVudEltcG9ydCIsInNwZWNpZmllciIsImV4cG9ydFN0YXRlbWVudCIsImdldFNyYyIsInByb2Nlc3MiLCJjd2QiLCJkb1ByZXBhcmF0aW9uIiwibmV3TmFtZXNwYWNlSW1wb3J0RXhpc3RzIiwic3BlY2lmaWVycyIsInNvbWUiLCJ0eXBlIiwibmV3RGVmYXVsdEltcG9ydEV4aXN0cyIsIm1vZHVsZSIsIm1ldGEiLCJkb2NzIiwidXJsIiwic2NoZW1hIiwicHJvcGVydGllcyIsImRlc2NyaXB0aW9uIiwibWluSXRlbXMiLCJpdGVtcyIsIm1pbkxlbmd0aCIsIm1pc3NpbmdFeHBvcnRzIiwidW51c2VkRXhwb3J0cyIsIm5vdCIsImVudW0iLCJhbnlPZiIsInJlcXVpcmVkIiwiY3JlYXRlIiwib3B0aW9ucyIsImdldEZpbGVuYW1lIiwiY2hlY2tFeHBvcnRQcmVzZW5jZSIsIm5vZGUiLCJleHBvcnRDb3VudCIsIm5hbWVzcGFjZUltcG9ydHMiLCJkZWxldGUiLCJzaXplIiwicmVwb3J0IiwiYm9keSIsImNoZWNrVXNhZ2UiLCJleHBvcnRlZFZhbHVlIiwidXBkYXRlRXhwb3J0VXNhZ2UiLCJuZXdFeHBvcnRzIiwibmV3RXhwb3J0SWRlbnRpZmllcnMiLCJkZWNsYXJhdGlvbiIsImxlbmd0aCIsImV4cG9ydGVkIiwibmFtZSIsImlkIiwiZGVjbGFyYXRpb25zIiwidXBkYXRlSW1wb3J0VXNhZ2UiLCJvbGRJbXBvcnRQYXRocyIsIm9sZE5hbWVzcGFjZUltcG9ydHMiLCJuZXdOYW1lc3BhY2VJbXBvcnRzIiwib2xkRXhwb3J0QWxsIiwibmV3RXhwb3J0QWxsIiwib2xkRGVmYXVsdEltcG9ydHMiLCJuZXdEZWZhdWx0SW1wb3J0cyIsIm9sZEltcG9ydHMiLCJuZXdJbXBvcnRzIiwiYXN0Tm9kZSIsInJlc29sdmVkUGF0aCIsInNvdXJjZSJdLCJtYXBwaW5ncyI6Ijs7QUFNQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztnTUFSQTs7Ozs7O0FBVUE7QUFDQSxJQUFJQSxrQkFBSjtBQUNBLElBQUk7QUFDRkEsdUJB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dXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGVPdmVydmlldyBFbnN1cmVzIHRoYXQgbW9kdWxlcyBjb250YWluIGV4cG9ydHMgYW5kL29yIGFsbCBcbiAqIG1vZHVsZXMgYXJlIGNvbnN1bWVkIHdpdGhpbiBvdGhlciBtb2R1bGVzLlxuICogQGF1dGhvciBSZW7DqSBGZXJtYW5uXG4gKi9cblxuaW1wb3J0IEV4cG9ydHMgZnJvbSAnLi4vRXhwb3J0TWFwJ1xuaW1wb3J0IHJlc29sdmUgZnJvbSAnZXNsaW50LW1vZHVsZS11dGlscy9yZXNvbHZlJ1xuaW1wb3J0IGRvY3NVcmwgZnJvbSAnLi4vZG9jc1VybCdcblxuLy8gZXNsaW50L2xpYi91dGlsL2dsb2ItdXRpbCBoYXMgYmVlbiBtb3ZlZCB0byBlc2xpbnQvbGliL3V0aWwvZ2xvYi11dGlscyB3aXRoIHZlcnNpb24gNS4zXG5sZXQgbGlzdEZpbGVzVG9Qcm9jZXNzXG50cnkge1xuICBsaXN0RmlsZXNUb1Byb2Nlc3MgPSByZXF1aXJlKCdlc2xpbnQvbGliL3V0aWwvZ2xvYi11dGlscycpLmxpc3RGaWxlc1RvUHJvY2Vzc1xufSBjYXRjaCAoZXJyKSB7XG4gIGxpc3RGaWxlc1RvUHJvY2VzcyA9IHJlcXVpcmUoJ2VzbGludC9saWIvdXRpbC9nbG9iLXV0aWwnKS5saXN0RmlsZXNUb1Byb2Nlc3Ncbn1cblxuY29uc3QgRVhQT1JUX0RFRkFVTFRfREVDTEFSQVRJT04gPSAnRXhwb3J0RGVmYXVsdERlY2xhcmF0aW9uJ1xuY29uc3QgRVhQT1JUX05BTUVEX0RFQ0xBUkFUSU9OID0gJ0V4cG9ydE5hbWVkRGVjbGFyYXRpb24nXG5jb25zdCBFWFBPUlRfQUxMX0RFQ0xBUkFUSU9OID0gJ0V4cG9ydEFsbERlY2xhcmF0aW9uJ1xuY29uc3QgSU1QT1JUX0RFQ0xBUkFUSU9OID0gJ0ltcG9ydERlY2xhcmF0aW9uJyBcbmNvbnN0IElNUE9SVF9OQU1FU1BBQ0VfU1BFQ0lGSUVSID0gJ0ltcG9ydE5hbWVzcGFjZVNwZWNpZmllcidcbmNvbnN0IElNUE9SVF9ERUZBVUxUX1NQRUNJRklFUiA9ICdJbXBvcnREZWZhdWx0U3BlY2lmaWVyJyBcbmNvbnN0IFZBUklBQkxFX0RFQ0xBUkFUSU9OID0gJ1ZhcmlhYmxlRGVjbGFyYXRpb24nXG5jb25zdCBGVU5DVElPTl9ERUNMQVJBVElPTiA9ICdGdW5jdGlvbkRlY2xhcmF0aW9uJ1xuY29uc3QgREVGQVVMVCA9ICdkZWZhdWx0J1xuXG5sZXQgcHJlcGFyYXRpb25Eb25lID0gZmFsc2VcbmNvbnN0IGltcG9ydExpc3QgPSBuZXcgTWFwKClcbmNvbnN0IGV4cG9ydExpc3QgPSBuZXcgTWFwKClcbmNvbnN0IGlnbm9yZWRGaWxlcyA9IG5ldyBTZXQoKVxuXG5jb25zdCBpc05vZGVNb2R1bGUgPSBwYXRoID0+IHtcbiAgcmV0dXJuIC9cXC8obm9kZV9tb2R1bGVzKVxcLy8udGVzdChwYXRoKVxufVxuXG4vKipcbiAqIHJlYWQgYWxsIGZpbGVzIG1hdGNoaW5nIHRoZSBwYXR0ZXJucyBpbiBzcmMgYW5kIGlnbm9yZUV4cG9ydHNcbiAqIFxuICogcmV0dXJuIGFsbCBmaWxlcyBtYXRjaGluZyBzcmMgcGF0dGVybiwgd2hpY2ggYXJlIG5vdCBtYXRjaGluZyB0aGUgaWdub3JlRXhwb3J0cyBwYXR0ZXJuXG4gKi9cbmNvbnN0IHJlc29sdmVGaWxlcyA9IChzcmMsIGlnbm9yZUV4cG9ydHMpID0+IHtcbiAgY29uc3Qgc3JjRmlsZXMgPSBuZXcgU2V0KClcbiAgY29uc3Qgc3JjRmlsZUxpc3QgPSBsaXN0RmlsZXNUb1Byb2Nlc3Moc3JjKVxuXG4gIC8vIHByZXBhcmUgbGlzdCBvZiBpZ25vcmVkIGZpbGVzXG4gIGNvbnN0IGlnbm9yZWRGaWxlc0xpc3QgPSAgbGlzdEZpbGVzVG9Qcm9jZXNzKGlnbm9yZUV4cG9ydHMpXG4gIGlnbm9yZWRGaWxlc0xpc3QuZm9yRWFjaCgoeyBmaWxlbmFtZSB9KSA9PiBpZ25vcmVkRmlsZXMuYWRkKGZpbGVuYW1lKSlcblxuICAvLyBwcmVwYXJlIGxpc3Qgb2Ygc291cmNlIGZpbGVzLCBkb24ndCBjb25zaWRlciBmaWxlcyBmcm9tIG5vZGVfbW9kdWxlc1xuICBzcmNGaWxlTGlzdC5maWx0ZXIoKHsgZmlsZW5hbWUgfSkgPT4gIWlzTm9kZU1vZHVsZShmaWxlbmFtZSkpLmZvckVhY2goKHsgZmlsZW5hbWUgfSkgPT4ge1xuICAgIHNyY0ZpbGVzLmFkZChmaWxlbmFtZSlcbiAgfSlcbiAgcmV0dXJuIHNyY0ZpbGVzXG59XG5cbi8qKlxuICogcGFyc2UgYWxsIHNvdXJjZSBmaWxlcyBhbmQgYnVpbGQgdXAgMiBtYXBzIGNvbnRhaW5pbmcgdGhlIGV4aXN0aW5nIGltcG9ydHMgYW5kIGV4cG9ydHNcbiAqL1xuY29uc3QgcHJlcGFyZUltcG9ydHNBbmRFeHBvcnRzID0gKHNyY0ZpbGVzLCBjb250ZXh0KSA9PiB7XG4gIGNvbnN0IGV4cG9ydEFsbCA9IG5ldyBNYXAoKVxuICBzcmNGaWxlcy5mb3JFYWNoKGZpbGUgPT4ge1xuICAgIGNvbnN0IGV4cG9ydHMgPSBuZXcgTWFwKClcbiAgICBjb25zdCBpbXBvcnRzID0gbmV3IE1hcCgpXG4gICAgY29uc3QgY3VycmVudEV4cG9ydHMgPSBFeHBvcnRzLmdldChmaWxlLCBjb250ZXh0KVxuICAgIGlmIChjdXJyZW50RXhwb3J0cykge1xuICAgICAgY29uc3QgeyBkZXBlbmRlbmNpZXMsIHJlZXhwb3J0cywgaW1wb3J0czogbG9jYWxJbXBvcnRMaXN0LCBuYW1lc3BhY2UgIH0gPSBjdXJyZW50RXhwb3J0c1xuXG4gICAgICAvLyBkZXBlbmRlbmNpZXMgPT09IGV4cG9ydCAqIGZyb20gXG4gICAgICBjb25zdCBjdXJyZW50RXhwb3J0QWxsID0gbmV3IFNldCgpXG4gICAgICBkZXBlbmRlbmNpZXMuZm9yRWFjaCh2YWx1ZSA9PiB7XG4gICAgICAgIGN1cnJlbnRFeHBvcnRBbGwuYWRkKHZhbHVlKCkucGF0aClcbiAgICAgIH0pXG4gICAgICBleHBvcnRBbGwuc2V0KGZpbGUsIGN1cnJlbnRFeHBvcnRBbGwpXG4gICAgICBcbiAgICAgIHJlZXhwb3J0cy5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgIGlmIChrZXkgPT09IERFRkFVTFQpIHtcbiAgICAgICAgICBleHBvcnRzLnNldChJTVBPUlRfREVGQVVMVF9TUEVDSUZJRVIsIHsgd2hlcmVVc2VkOiBuZXcgU2V0KCkgfSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBleHBvcnRzLnNldChrZXksIHsgd2hlcmVVc2VkOiBuZXcgU2V0KCkgfSlcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZWV4cG9ydCA9ICB2YWx1ZS5nZXRJbXBvcnQoKVxuICAgICAgICBpZiAoIXJlZXhwb3J0KSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgbGV0IGxvY2FsSW1wb3J0ID0gaW1wb3J0cy5nZXQocmVleHBvcnQucGF0aClcbiAgICAgICAgbGV0IGN1cnJlbnRWYWx1ZVxuICAgICAgICBpZiAodmFsdWUubG9jYWwgPT09IERFRkFVTFQpIHtcbiAgICAgICAgICBjdXJyZW50VmFsdWUgPSBJTVBPUlRfREVGQVVMVF9TUEVDSUZJRVJcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjdXJyZW50VmFsdWUgPSB2YWx1ZS5sb2NhbFxuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgbG9jYWxJbXBvcnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgbG9jYWxJbXBvcnQgPSBuZXcgU2V0KFsuLi5sb2NhbEltcG9ydCwgY3VycmVudFZhbHVlXSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsb2NhbEltcG9ydCA9IG5ldyBTZXQoW2N1cnJlbnRWYWx1ZV0pXG4gICAgICAgIH1cbiAgICAgICAgaW1wb3J0cy5zZXQocmVleHBvcnQucGF0aCwgbG9jYWxJbXBvcnQpXG4gICAgICB9KVxuXG4gICAgICBsb2NhbEltcG9ydExpc3QuZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xuICAgICAgICBpZiAoaXNOb2RlTW9kdWxlKGtleSkpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBpbXBvcnRzLnNldChrZXksIHZhbHVlLmltcG9ydGVkU3BlY2lmaWVycylcbiAgICAgIH0pXG4gICAgICBpbXBvcnRMaXN0LnNldChmaWxlLCBpbXBvcnRzKVxuICAgICAgXG4gICAgICAvLyBidWlsZCB1cCBleHBvcnQgbGlzdCBvbmx5LCBpZiBmaWxlIGlzIG5vdCBpZ25vcmVkXG4gICAgICBpZiAoaWdub3JlZEZpbGVzLmhhcyhmaWxlKSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIG5hbWVzcGFjZS5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgIGlmIChrZXkgPT09IERFRkFVTFQpIHtcbiAgICAgICAgICBleHBvcnRzLnNldChJTVBPUlRfREVGQVVMVF9TUEVDSUZJRVIsIHsgd2hlcmVVc2VkOiBuZXcgU2V0KCkgfSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBleHBvcnRzLnNldChrZXksIHsgd2hlcmVVc2VkOiBuZXcgU2V0KCkgfSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gICAgZXhwb3J0cy5zZXQoRVhQT1JUX0FMTF9ERUNMQVJBVElPTiwgeyB3aGVyZVVzZWQ6IG5ldyBTZXQoKSB9KVxuICAgIGV4cG9ydHMuc2V0KElNUE9SVF9OQU1FU1BBQ0VfU1BFQ0lGSUVSLCB7IHdoZXJlVXNlZDogbmV3IFNldCgpIH0pXG4gICAgZXhwb3J0TGlzdC5zZXQoZmlsZSwgZXhwb3J0cylcbiAgfSlcbiAgZXhwb3J0QWxsLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICB2YWx1ZS5mb3JFYWNoKHZhbCA9PiB7XG4gICAgICBjb25zdCBjdXJyZW50RXhwb3J0cyA9IGV4cG9ydExpc3QuZ2V0KHZhbClcbiAgICAgIGNvbnN0IGN1cnJlbnRFeHBvcnQgPSBjdXJyZW50RXhwb3J0cy5nZXQoRVhQT1JUX0FMTF9ERUNMQVJBVElPTilcbiAgICAgIGN1cnJlbnRFeHBvcnQud2hlcmVVc2VkLmFkZChrZXkpXG4gICAgfSlcbiAgfSlcbn1cblxuLyoqXG4gKiB0cmF2ZXJzZSB0aHJvdWdoIGFsbCBpbXBvcnRzIGFuZCBhZGQgdGhlIHJlc3BlY3RpdmUgcGF0aCB0byB0aGUgd2hlcmVVc2VkLWxpc3QgXG4gKiBvZiB0aGUgY29ycmVzcG9uZGluZyBleHBvcnRcbiAqL1xuY29uc3QgZGV0ZXJtaW5lVXNhZ2UgPSAoKSA9PiB7XG4gIGltcG9ydExpc3QuZm9yRWFjaCgobGlzdFZhbHVlLCBsaXN0S2V5KSA9PiB7XG4gICAgbGlzdFZhbHVlLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgIGNvbnN0IGV4cG9ydHMgPSBleHBvcnRMaXN0LmdldChrZXkpXG4gICAgICBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHZhbHVlLmZvckVhY2goY3VycmVudEltcG9ydCA9PiB7XG4gICAgICAgICAgbGV0IHNwZWNpZmllclxuICAgICAgICAgIGlmIChjdXJyZW50SW1wb3J0ID09PSBJTVBPUlRfTkFNRVNQQUNFX1NQRUNJRklFUikge1xuICAgICAgICAgICAgc3BlY2lmaWVyID0gSU1QT1JUX05BTUVTUEFDRV9TUEVDSUZJRVJcbiAgICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRJbXBvcnQgPT09IElNUE9SVF9ERUZBVUxUX1NQRUNJRklFUikge1xuICAgICAgICAgICAgc3BlY2lmaWVyID0gSU1QT1JUX0RFRkFVTFRfU1BFQ0lGSUVSXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNwZWNpZmllciA9IGN1cnJlbnRJbXBvcnRcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHR5cGVvZiBzcGVjaWZpZXIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBjb25zdCBleHBvcnRTdGF0ZW1lbnQgPSBleHBvcnRzLmdldChzcGVjaWZpZXIpXG4gICAgICAgICAgICBpZiAodHlwZW9mIGV4cG9ydFN0YXRlbWVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgY29uc3QgeyB3aGVyZVVzZWQgfSA9IGV4cG9ydFN0YXRlbWVudFxuICAgICAgICAgICAgICB3aGVyZVVzZWQuYWRkKGxpc3RLZXkpXG4gICAgICAgICAgICAgIGV4cG9ydHMuc2V0KHNwZWNpZmllciwgeyB3aGVyZVVzZWQgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSlcbiAgfSlcbn1cblxuY29uc3QgZ2V0U3JjID0gc3JjID0+IHtcbiAgaWYgKHNyYykge1xuICAgIHJldHVybiBzcmNcbiAgfVxuICByZXR1cm4gW3Byb2Nlc3MuY3dkKCldXG59XG5cbi8qKlxuICogcHJlcGFyZSB0aGUgbGlzdHMgb2YgZXhpc3RpbmcgaW1wb3J0cyBhbmQgZXhwb3J0cyAtIHNob3VsZCBvbmx5IGJlIGV4ZWN1dGVkIG9uY2UgYXRcbiAqIHRoZSBzdGFydCBvZiBhIG5ldyBlc2xpbnQgcnVuXG4gKi9cbmNvbnN0IGRvUHJlcGFyYXRpb24gPSAoc3JjLCBpZ25vcmVFeHBvcnRzLCBjb250ZXh0KSA9PiB7XG4gIGNvbnN0IHNyY0ZpbGVzID0gcmVzb2x2ZUZpbGVzKGdldFNyYyhzcmMpLCBpZ25vcmVFeHBvcnRzKVxuICBwcmVwYXJlSW1wb3J0c0FuZEV4cG9ydHMoc3JjRmlsZXMsIGNvbnRleHQpXG4gIGRldGVybWluZVVzYWdlKClcbiAgcHJlcGFyYXRpb25Eb25lID0gdHJ1ZVxufVxuXG5jb25zdCBuZXdOYW1lc3BhY2VJbXBvcnRFeGlzdHMgPSBzcGVjaWZpZXJzID0+XG4gIHNwZWNpZmllcnMuc29tZSgoeyB0eXBlIH0pID0+IHR5cGUgPT09IElNUE9SVF9OQU1FU1BBQ0VfU1BFQ0lGSUVSKVxuXG5jb25zdCBuZXdEZWZhdWx0SW1wb3J0RXhpc3RzID0gc3BlY2lmaWVycyA9PlxuICBzcGVjaWZpZXJzLnNvbWUoKHsgdHlwZSB9KSA9PiB0eXBlID09PSBJTVBPUlRfREVGQVVMVF9TUEVDSUZJRVIpXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBtZXRhOiB7XG4gICAgZG9jczogeyB1cmw6IGRvY3NVcmwoJ25vLXVudXNlZC1tb2R1bGVzJykgfSxcbiAgICBzY2hlbWE6IFt7XG4gICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIHNyYzoge1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnZmlsZXMvcGF0aHMgdG8gYmUgYW5hbHl6ZWQgKG9ubHkgZm9yIHVudXNlZCBleHBvcnRzKScsXG4gICAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgICBtaW5JdGVtczogMSxcbiAgICAgICAgICBpdGVtczoge1xuICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICBtaW5MZW5ndGg6IDEsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgaWdub3JlRXhwb3J0czoge1xuICAgICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICAgJ2ZpbGVzL3BhdGhzIGZvciB3aGljaCB1bnVzZWQgZXhwb3J0cyB3aWxsIG5vdCBiZSByZXBvcnRlZCAoZS5nIG1vZHVsZSBlbnRyeSBwb2ludHMpJyxcbiAgICAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgICAgIG1pbkl0ZW1zOiAxLFxuICAgICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgIG1pbkxlbmd0aDogMSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBtaXNzaW5nRXhwb3J0czoge1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAncmVwb3J0IG1vZHVsZXMgd2l0aG91dCBhbnkgZXhwb3J0cycsXG4gICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICB9LFxuICAgICAgICB1bnVzZWRFeHBvcnRzOiB7XG4gICAgICAgICAgZGVzY3JpcHRpb246ICdyZXBvcnQgZXhwb3J0cyB3aXRob3V0IGFueSB1c2FnZScsXG4gICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIG5vdDoge1xuICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgdW51c2VkRXhwb3J0czogeyBlbnVtOiBbZmFsc2VdIH0sXG4gICAgICAgICAgbWlzc2luZ0V4cG9ydHM6IHsgZW51bTogW2ZhbHNlXSB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGFueU9mOlt7XG4gICAgICAgIG5vdDoge1xuICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIHVudXNlZEV4cG9ydHM6IHsgZW51bTogW3RydWVdIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgcmVxdWlyZWQ6IFsnbWlzc2luZ0V4cG9ydHMnXSxcbiAgICAgIH0sIHtcbiAgICAgICAgbm90OiB7XG4gICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgbWlzc2luZ0V4cG9ydHM6IHsgZW51bTogW3RydWVdIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgcmVxdWlyZWQ6IFsndW51c2VkRXhwb3J0cyddLFxuICAgICAgfSwge1xuICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgdW51c2VkRXhwb3J0czogeyBlbnVtOiBbdHJ1ZV0gfSxcbiAgICAgICAgfSxcbiAgICAgICAgcmVxdWlyZWQ6IFsndW51c2VkRXhwb3J0cyddLFxuICAgICAgfSwge1xuICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgbWlzc2luZ0V4cG9ydHM6IHsgZW51bTogW3RydWVdIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHJlcXVpcmVkOiBbJ21pc3NpbmdFeHBvcnRzJ10sXG4gICAgICB9XSxcbiAgICB9XSxcbiAgfSxcblxuICBjcmVhdGU6IGNvbnRleHQgPT4ge1xuICAgIGNvbnN0IHtcbiAgICAgIHNyYyxcbiAgICAgIGlnbm9yZUV4cG9ydHMgPSBbXSxcbiAgICAgIG1pc3NpbmdFeHBvcnRzLFxuICAgICAgdW51c2VkRXhwb3J0cyxcbiAgICB9ID0gY29udGV4dC5vcHRpb25zWzBdIHx8IHt9XG5cbiAgICBpZiAodW51c2VkRXhwb3J0cyAmJiAhcHJlcGFyYXRpb25Eb25lKSB7XG4gICAgICBkb1ByZXBhcmF0aW9uKHNyYywgaWdub3JlRXhwb3J0cywgY29udGV4dClcbiAgICB9XG4gICAgXG4gICAgY29uc3QgZmlsZSA9IGNvbnRleHQuZ2V0RmlsZW5hbWUoKVxuXG4gICAgY29uc3QgY2hlY2tFeHBvcnRQcmVzZW5jZSA9IG5vZGUgPT4ge1xuICAgICAgaWYgKCFtaXNzaW5nRXhwb3J0cykge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgaWYgKGlnbm9yZWRGaWxlcy5oYXMoZmlsZSkpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGV4cG9ydENvdW50ID0gZXhwb3J0TGlzdC5nZXQoZmlsZSlcbiAgICAgIGNvbnN0IGV4cG9ydEFsbCA9IGV4cG9ydENvdW50LmdldChFWFBPUlRfQUxMX0RFQ0xBUkFUSU9OKVxuICAgICAgY29uc3QgbmFtZXNwYWNlSW1wb3J0cyA9IGV4cG9ydENvdW50LmdldChJTVBPUlRfTkFNRVNQQUNFX1NQRUNJRklFUilcblxuICAgICAgZXhwb3J0Q291bnQuZGVsZXRlKEVYUE9SVF9BTExfREVDTEFSQVRJT04pXG4gICAgICBleHBvcnRDb3VudC5kZWxldGUoSU1QT1JUX05BTUVTUEFDRV9TUEVDSUZJRVIpXG4gICAgICBpZiAobWlzc2luZ0V4cG9ydHMgJiYgZXhwb3J0Q291bnQuc2l6ZSA8IDEpIHtcbiAgICAgICAgLy8gbm9kZS5ib2R5WzBdID09PSAndW5kZWZpbmVkJyBvbmx5IGhhcHBlbnMsIGlmIGV2ZXJ5dGhpbmcgaXMgY29tbWVudGVkIG91dCBpbiB0aGUgZmlsZVxuICAgICAgICAvLyBiZWluZyBsaW50ZWRcbiAgICAgICAgY29udGV4dC5yZXBvcnQobm9kZS5ib2R5WzBdID8gbm9kZS5ib2R5WzBdIDogbm9kZSwgJ05vIGV4cG9ydHMgZm91bmQnKVxuICAgICAgfVxuICAgICAgZXhwb3J0Q291bnQuc2V0KEVYUE9SVF9BTExfREVDTEFSQVRJT04sIGV4cG9ydEFsbClcbiAgICAgIGV4cG9ydENvdW50LnNldChJTVBPUlRfTkFNRVNQQUNFX1NQRUNJRklFUiwgbmFtZXNwYWNlSW1wb3J0cylcbiAgICB9XG5cbiAgICBjb25zdCBjaGVja1VzYWdlID0gKG5vZGUsIGV4cG9ydGVkVmFsdWUpID0+IHtcbiAgICAgIGlmICghdW51c2VkRXhwb3J0cykge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgaWYgKGlnbm9yZWRGaWxlcy5oYXMoZmlsZSkpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGV4cG9ydHMgPSBleHBvcnRMaXN0LmdldChmaWxlKVxuXG4gICAgICAvLyBzcGVjaWFsIGNhc2U6IGV4cG9ydCAqIGZyb20gXG4gICAgICBjb25zdCBleHBvcnRBbGwgPSBleHBvcnRzLmdldChFWFBPUlRfQUxMX0RFQ0xBUkFUSU9OKVxuICAgICAgaWYgKHR5cGVvZiBleHBvcnRBbGwgIT09ICd1bmRlZmluZWQnICYmIGV4cG9ydGVkVmFsdWUgIT09IElNUE9SVF9ERUZBVUxUX1NQRUNJRklFUikge1xuICAgICAgICBpZiAoZXhwb3J0QWxsLndoZXJlVXNlZC5zaXplID4gMCkge1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIHNwZWNpYWwgY2FzZTogbmFtZXNwYWNlIGltcG9ydFxuICAgICAgY29uc3QgbmFtZXNwYWNlSW1wb3J0cyA9IGV4cG9ydHMuZ2V0KElNUE9SVF9OQU1FU1BBQ0VfU1BFQ0lGSUVSKVxuICAgICAgaWYgKHR5cGVvZiBuYW1lc3BhY2VJbXBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBpZiAobmFtZXNwYWNlSW1wb3J0cy53aGVyZVVzZWQuc2l6ZSA+IDApIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCBleHBvcnRTdGF0ZW1lbnQgPSBleHBvcnRzLmdldChleHBvcnRlZFZhbHVlKVxuICAgICAgXG4gICAgICBjb25zdCB2YWx1ZSA9IGV4cG9ydGVkVmFsdWUgPT09IElNUE9SVF9ERUZBVUxUX1NQRUNJRklFUiA/IERFRkFVTFQgOiBleHBvcnRlZFZhbHVlXG4gICAgICBcbiAgICAgIGlmICh0eXBlb2YgZXhwb3J0U3RhdGVtZW50ICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIGlmIChleHBvcnRTdGF0ZW1lbnQud2hlcmVVc2VkLnNpemUgPCAxKSB7XG4gICAgICAgICAgY29udGV4dC5yZXBvcnQoXG4gICAgICAgICAgICBub2RlLFxuICAgICAgICAgICAgYGV4cG9ydGVkIGRlY2xhcmF0aW9uICcke3ZhbHVlfScgbm90IHVzZWQgd2l0aGluIG90aGVyIG1vZHVsZXNgXG4gICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb250ZXh0LnJlcG9ydChcbiAgICAgICAgICBub2RlLFxuICAgICAgICAgIGBleHBvcnRlZCBkZWNsYXJhdGlvbiAnJHt2YWx1ZX0nIG5vdCB1c2VkIHdpdGhpbiBvdGhlciBtb2R1bGVzYFxuICAgICAgICApXG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogb25seSB1c2VmdWwgZm9yIHRvb2xzIGxpa2UgdnNjb2RlLWVzbGludFxuICAgICAqIFxuICAgICAqIHVwZGF0ZSBsaXN0cyBvZiBleGlzdGluZyBleHBvcnRzIGR1cmluZyBydW50aW1lXG4gICAgICovXG4gICAgY29uc3QgdXBkYXRlRXhwb3J0VXNhZ2UgPSBub2RlID0+IHtcbiAgICAgIGlmIChpZ25vcmVkRmlsZXMuaGFzKGZpbGUpKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBsZXQgZXhwb3J0cyA9IGV4cG9ydExpc3QuZ2V0KGZpbGUpXG5cbiAgICAgIC8vIG5ldyBtb2R1bGUgaGFzIGJlZW4gY3JlYXRlZCBkdXJpbmcgcnVudGltZVxuICAgICAgLy8gaW5jbHVkZSBpdCBpbiBmdXJ0aGVyIHByb2Nlc3NpbmdcbiAgICAgIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgZXhwb3J0cyA9IG5ldyBNYXAoKVxuICAgICAgfVxuXG4gICAgICBjb25zdCBuZXdFeHBvcnRzID0gbmV3IE1hcCgpXG4gICAgICBjb25zdCBuZXdFeHBvcnRJZGVudGlmaWVycyA9IG5ldyBTZXQoKVxuXG4gICAgICBub2RlLmJvZHkuZm9yRWFjaCgoeyB0eXBlLCBkZWNsYXJhdGlvbiwgc3BlY2lmaWVycyB9KSA9PiB7XG4gICAgICAgIGlmICh0eXBlID09PSBFWFBPUlRfREVGQVVMVF9ERUNMQVJBVElPTikge1xuICAgICAgICAgIG5ld0V4cG9ydElkZW50aWZpZXJzLmFkZChJTVBPUlRfREVGQVVMVF9TUEVDSUZJRVIpXG4gICAgICAgIH0gXG4gICAgICAgIGlmICh0eXBlID09PSBFWFBPUlRfTkFNRURfREVDTEFSQVRJT04pIHtcbiAgICAgICAgICBpZiAoc3BlY2lmaWVycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBzcGVjaWZpZXJzLmZvckVhY2goc3BlY2lmaWVyID0+IHtcbiAgICAgICAgICAgICAgaWYgKHNwZWNpZmllci5leHBvcnRlZCkge1xuICAgICAgICAgICAgICAgIG5ld0V4cG9ydElkZW50aWZpZXJzLmFkZChzcGVjaWZpZXIuZXhwb3J0ZWQubmFtZSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGRlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgICBpZiAoZGVjbGFyYXRpb24udHlwZSA9PT0gRlVOQ1RJT05fREVDTEFSQVRJT04pIHtcbiAgICAgICAgICAgICAgbmV3RXhwb3J0SWRlbnRpZmllcnMuYWRkKGRlY2xhcmF0aW9uLmlkLm5hbWUpXG4gICAgICAgICAgICB9ICAgXG4gICAgICAgICAgICBpZiAoZGVjbGFyYXRpb24udHlwZSA9PT0gVkFSSUFCTEVfREVDTEFSQVRJT04pIHtcbiAgICAgICAgICAgICAgZGVjbGFyYXRpb24uZGVjbGFyYXRpb25zLmZvckVhY2goKHsgaWQgfSkgPT4ge1xuICAgICAgICAgICAgICAgIG5ld0V4cG9ydElkZW50aWZpZXJzLmFkZChpZC5uYW1lKVxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgLy8gb2xkIGV4cG9ydHMgZXhpc3Qgd2l0aGluIGxpc3Qgb2YgbmV3IGV4cG9ydHMgaWRlbnRpZmllcnM6IGFkZCB0byBtYXAgb2YgbmV3IGV4cG9ydHNcbiAgICAgIGV4cG9ydHMuZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xuICAgICAgICBpZiAobmV3RXhwb3J0SWRlbnRpZmllcnMuaGFzKGtleSkpIHtcbiAgICAgICAgICBuZXdFeHBvcnRzLnNldChrZXksIHZhbHVlKVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICAvLyBuZXcgZXhwb3J0IGlkZW50aWZpZXJzIGFkZGVkOiBhZGQgdG8gbWFwIG9mIG5ldyBleHBvcnRzXG4gICAgICBuZXdFeHBvcnRJZGVudGlmaWVycy5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgIGlmICghZXhwb3J0cy5oYXMoa2V5KSkge1xuICAgICAgICAgIG5ld0V4cG9ydHMuc2V0KGtleSwgeyB3aGVyZVVzZWQ6IG5ldyBTZXQoKSB9KVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICAvLyBwcmVzZXJ2ZSBpbmZvcm1hdGlvbiBhYm91dCBuYW1lc3BhY2UgaW1wb3J0c1xuICAgICAgbGV0IGV4cG9ydEFsbCA9IGV4cG9ydHMuZ2V0KEVYUE9SVF9BTExfREVDTEFSQVRJT04pXG4gICAgICBsZXQgbmFtZXNwYWNlSW1wb3J0cyA9IGV4cG9ydHMuZ2V0KElNUE9SVF9OQU1FU1BBQ0VfU1BFQ0lGSUVSKVxuICAgICAgXG4gICAgICBpZiAodHlwZW9mIG5hbWVzcGFjZUltcG9ydHMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIG5hbWVzcGFjZUltcG9ydHMgPSB7IHdoZXJlVXNlZDogbmV3IFNldCgpIH1cbiAgICAgIH1cblxuICAgICAgbmV3RXhwb3J0cy5zZXQoRVhQT1JUX0FMTF9ERUNMQVJBVElPTiwgZXhwb3J0QWxsKVxuICAgICAgbmV3RXhwb3J0cy5zZXQoSU1QT1JUX05BTUVTUEFDRV9TUEVDSUZJRVIsIG5hbWVzcGFjZUltcG9ydHMpXG4gICAgICBleHBvcnRMaXN0LnNldChmaWxlLCBuZXdFeHBvcnRzKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIG9ubHkgdXNlZnVsIGZvciB0b29scyBsaWtlIHZzY29kZS1lc2xpbnRcbiAgICAgKiBcbiAgICAgKiB1cGRhdGUgbGlzdHMgb2YgZXhpc3RpbmcgaW1wb3J0cyBkdXJpbmcgcnVudGltZVxuICAgICAqL1xuICAgIGNvbnN0IHVwZGF0ZUltcG9ydFVzYWdlID0gbm9kZSA9PiB7XG4gICAgICBpZiAoIXVudXNlZEV4cG9ydHMpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGxldCBvbGRJbXBvcnRQYXRocyA9IGltcG9ydExpc3QuZ2V0KGZpbGUpXG4gICAgICBpZiAodHlwZW9mIG9sZEltcG9ydFBhdGhzID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBvbGRJbXBvcnRQYXRocyA9IG5ldyBNYXAoKVxuICAgICAgfVxuICAgICAgXG4gICAgICBjb25zdCBvbGROYW1lc3BhY2VJbXBvcnRzID0gbmV3IFNldCgpXG4gICAgICBjb25zdCBuZXdOYW1lc3BhY2VJbXBvcnRzID0gbmV3IFNldCgpXG5cbiAgICAgIGNvbnN0IG9sZEV4cG9ydEFsbCA9IG5ldyBTZXQoKVxuICAgICAgY29uc3QgbmV3RXhwb3J0QWxsID0gbmV3IFNldCgpXG4gICAgICBcbiAgICAgIGNvbnN0IG9sZERlZmF1bHRJbXBvcnRzID0gbmV3IFNldCgpXG4gICAgICBjb25zdCBuZXdEZWZhdWx0SW1wb3J0cyA9IG5ldyBTZXQoKVxuXG4gICAgICBjb25zdCBvbGRJbXBvcnRzID0gbmV3IE1hcCgpXG4gICAgICBjb25zdCBuZXdJbXBvcnRzID0gbmV3IE1hcCgpXG4gICAgICBvbGRJbXBvcnRQYXRocy5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgIGlmICh2YWx1ZS5oYXMoRVhQT1JUX0FMTF9ERUNMQVJBVElPTikpIHtcbiAgICAgICAgICBvbGRFeHBvcnRBbGwuYWRkKGtleSlcbiAgICAgICAgfVxuICAgICAgICBpZiAodmFsdWUuaGFzKElNUE9SVF9OQU1FU1BBQ0VfU1BFQ0lGSUVSKSkge1xuICAgICAgICAgIG9sZE5hbWVzcGFjZUltcG9ydHMuYWRkKGtleSlcbiAgICAgICAgfVxuICAgICAgICBpZiAodmFsdWUuaGFzKElNUE9SVF9ERUZBVUxUX1NQRUNJRklFUikpIHtcbiAgICAgICAgICBvbGREZWZhdWx0SW1wb3J0cy5hZGQoa2V5KVxuICAgICAgICB9XG4gICAgICAgIHZhbHVlLmZvckVhY2godmFsID0+IHtcbiAgICAgICAgICBpZiAodmFsICE9PSBJTVBPUlRfTkFNRVNQQUNFX1NQRUNJRklFUiAmJlxuICAgICAgICAgICAgICB2YWwgIT09IElNUE9SVF9ERUZBVUxUX1NQRUNJRklFUikge1xuICAgICAgICAgICAgICAgb2xkSW1wb3J0cy5zZXQodmFsLCBrZXkpXG4gICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgbm9kZS5ib2R5LmZvckVhY2goYXN0Tm9kZSA9PiB7XG4gICAgICAgIGxldCByZXNvbHZlZFBhdGhcblxuICAgICAgICAvLyBzdXBwb3J0IGZvciBleHBvcnQgeyB2YWx1ZSB9IGZyb20gJ21vZHVsZSdcbiAgICAgICAgaWYgKGFzdE5vZGUudHlwZSA9PT0gRVhQT1JUX05BTUVEX0RFQ0xBUkFUSU9OKSB7XG4gICAgICAgICAgaWYgKGFzdE5vZGUuc291cmNlKSB7XG4gICAgICAgICAgICByZXNvbHZlZFBhdGggPSByZXNvbHZlKGFzdE5vZGUuc291cmNlLnZhbHVlLCBjb250ZXh0KVxuICAgICAgICAgICAgYXN0Tm9kZS5zcGVjaWZpZXJzLmZvckVhY2goc3BlY2lmaWVyID0+IHtcbiAgICAgICAgICAgICAgbGV0IG5hbWVcbiAgICAgICAgICAgICAgaWYgKHNwZWNpZmllci5leHBvcnRlZC5uYW1lID09PSBERUZBVUxUKSB7XG4gICAgICAgICAgICAgICAgbmFtZSA9IElNUE9SVF9ERUZBVUxUX1NQRUNJRklFUlxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5hbWUgPSBzcGVjaWZpZXIubG9jYWwubmFtZVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIG5ld0ltcG9ydHMuc2V0KG5hbWUsIHJlc29sdmVkUGF0aClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGFzdE5vZGUudHlwZSA9PT0gRVhQT1JUX0FMTF9ERUNMQVJBVElPTikge1xuICAgICAgICAgIHJlc29sdmVkUGF0aCA9IHJlc29sdmUoYXN0Tm9kZS5zb3VyY2UudmFsdWUsIGNvbnRleHQpXG4gICAgICAgICAgbmV3RXhwb3J0QWxsLmFkZChyZXNvbHZlZFBhdGgpXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYXN0Tm9kZS50eXBlID09PSBJTVBPUlRfREVDTEFSQVRJT04pIHtcbiAgICAgICAgICByZXNvbHZlZFBhdGggPSByZXNvbHZlKGFzdE5vZGUuc291cmNlLnZhbHVlLCBjb250ZXh0KSAgICAgICBcbiAgICAgICAgICBpZiAoIXJlc29sdmVkUGF0aCkge1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgfVxuICAgICAgICAgIFxuICAgICAgICAgIGlmIChpc05vZGVNb2R1bGUocmVzb2x2ZWRQYXRoKSkge1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKG5ld05hbWVzcGFjZUltcG9ydEV4aXN0cyhhc3ROb2RlLnNwZWNpZmllcnMpKSB7XG4gICAgICAgICAgICBuZXdOYW1lc3BhY2VJbXBvcnRzLmFkZChyZXNvbHZlZFBhdGgpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKG5ld0RlZmF1bHRJbXBvcnRFeGlzdHMoYXN0Tm9kZS5zcGVjaWZpZXJzKSkge1xuICAgICAgICAgICAgbmV3RGVmYXVsdEltcG9ydHMuYWRkKHJlc29sdmVkUGF0aClcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBhc3ROb2RlLnNwZWNpZmllcnMuZm9yRWFjaChzcGVjaWZpZXIgPT4ge1xuICAgICAgICAgICAgaWYgKHNwZWNpZmllci50eXBlID09PSBJTVBPUlRfREVGQVVMVF9TUEVDSUZJRVIgfHxcbiAgICAgICAgICAgICAgICBzcGVjaWZpZXIudHlwZSA9PT0gSU1QT1JUX05BTUVTUEFDRV9TUEVDSUZJRVIpIHtcbiAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBuZXdJbXBvcnRzLnNldChzcGVjaWZpZXIubG9jYWwubmFtZSwgcmVzb2x2ZWRQYXRoKVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIG5ld0V4cG9ydEFsbC5mb3JFYWNoKHZhbHVlID0+IHtcbiAgICAgICAgaWYgKCFvbGRFeHBvcnRBbGwuaGFzKHZhbHVlKSkge1xuICAgICAgICAgIGxldCBpbXBvcnRzID0gb2xkSW1wb3J0UGF0aHMuZ2V0KHZhbHVlKVxuICAgICAgICAgIGlmICh0eXBlb2YgaW1wb3J0cyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGltcG9ydHMgPSBuZXcgU2V0KClcbiAgICAgICAgICB9XG4gICAgICAgICAgaW1wb3J0cy5hZGQoRVhQT1JUX0FMTF9ERUNMQVJBVElPTilcbiAgICAgICAgICBvbGRJbXBvcnRQYXRocy5zZXQodmFsdWUsIGltcG9ydHMpXG5cbiAgICAgICAgICBsZXQgZXhwb3J0cyA9IGV4cG9ydExpc3QuZ2V0KHZhbHVlKVxuICAgICAgICAgIGxldCBjdXJyZW50RXhwb3J0XG4gICAgICAgICAgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgY3VycmVudEV4cG9ydCA9IGV4cG9ydHMuZ2V0KEVYUE9SVF9BTExfREVDTEFSQVRJT04pXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGV4cG9ydHMgPSBuZXcgTWFwKClcbiAgICAgICAgICAgIGV4cG9ydExpc3Quc2V0KHZhbHVlLCBleHBvcnRzKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh0eXBlb2YgY3VycmVudEV4cG9ydCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGN1cnJlbnRFeHBvcnQud2hlcmVVc2VkLmFkZChmaWxlKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCB3aGVyZVVzZWQgPSBuZXcgU2V0KClcbiAgICAgICAgICAgIHdoZXJlVXNlZC5hZGQoZmlsZSlcbiAgICAgICAgICAgIGV4cG9ydHMuc2V0KEVYUE9SVF9BTExfREVDTEFSQVRJT04sIHsgd2hlcmVVc2VkIH0pXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICBvbGRFeHBvcnRBbGwuZm9yRWFjaCh2YWx1ZSA9PiB7XG4gICAgICAgIGlmICghbmV3RXhwb3J0QWxsLmhhcyh2YWx1ZSkpIHtcbiAgICAgICAgICBjb25zdCBpbXBvcnRzID0gb2xkSW1wb3J0UGF0aHMuZ2V0KHZhbHVlKVxuICAgICAgICAgIGltcG9ydHMuZGVsZXRlKEVYUE9SVF9BTExfREVDTEFSQVRJT04pXG5cbiAgICAgICAgICBjb25zdCBleHBvcnRzID0gZXhwb3J0TGlzdC5nZXQodmFsdWUpXG4gICAgICAgICAgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgY29uc3QgY3VycmVudEV4cG9ydCA9IGV4cG9ydHMuZ2V0KEVYUE9SVF9BTExfREVDTEFSQVRJT04pXG4gICAgICAgICAgICBpZiAodHlwZW9mIGN1cnJlbnRFeHBvcnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgIGN1cnJlbnRFeHBvcnQud2hlcmVVc2VkLmRlbGV0ZShmaWxlKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgbmV3RGVmYXVsdEltcG9ydHMuZm9yRWFjaCh2YWx1ZSA9PiB7XG4gICAgICAgIGlmICghb2xkRGVmYXVsdEltcG9ydHMuaGFzKHZhbHVlKSkge1xuICAgICAgICAgIGxldCBpbXBvcnRzID0gb2xkSW1wb3J0UGF0aHMuZ2V0KHZhbHVlKVxuICAgICAgICAgIGlmICh0eXBlb2YgaW1wb3J0cyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGltcG9ydHMgPSBuZXcgU2V0KClcbiAgICAgICAgICB9XG4gICAgICAgICAgaW1wb3J0cy5hZGQoSU1QT1JUX0RFRkFVTFRfU1BFQ0lGSUVSKVxuICAgICAgICAgIG9sZEltcG9ydFBhdGhzLnNldCh2YWx1ZSwgaW1wb3J0cylcblxuICAgICAgICAgIGxldCBleHBvcnRzID0gZXhwb3J0TGlzdC5nZXQodmFsdWUpXG4gICAgICAgICAgbGV0IGN1cnJlbnRFeHBvcnRcbiAgICAgICAgICBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBjdXJyZW50RXhwb3J0ID0gZXhwb3J0cy5nZXQoSU1QT1JUX0RFRkFVTFRfU1BFQ0lGSUVSKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBleHBvcnRzID0gbmV3IE1hcCgpXG4gICAgICAgICAgICBleHBvcnRMaXN0LnNldCh2YWx1ZSwgZXhwb3J0cylcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodHlwZW9mIGN1cnJlbnRFeHBvcnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBjdXJyZW50RXhwb3J0LndoZXJlVXNlZC5hZGQoZmlsZSlcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qgd2hlcmVVc2VkID0gbmV3IFNldCgpXG4gICAgICAgICAgICB3aGVyZVVzZWQuYWRkKGZpbGUpXG4gICAgICAgICAgICBleHBvcnRzLnNldChJTVBPUlRfREVGQVVMVF9TUEVDSUZJRVIsIHsgd2hlcmVVc2VkIH0pXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICBvbGREZWZhdWx0SW1wb3J0cy5mb3JFYWNoKHZhbHVlID0+IHtcbiAgICAgICAgaWYgKCFuZXdEZWZhdWx0SW1wb3J0cy5oYXModmFsdWUpKSB7XG4gICAgICAgICAgY29uc3QgaW1wb3J0cyA9IG9sZEltcG9ydFBhdGhzLmdldCh2YWx1ZSlcbiAgICAgICAgICBpbXBvcnRzLmRlbGV0ZShJTVBPUlRfREVGQVVMVF9TUEVDSUZJRVIpXG5cbiAgICAgICAgICBjb25zdCBleHBvcnRzID0gZXhwb3J0TGlzdC5nZXQodmFsdWUpXG4gICAgICAgICAgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgY29uc3QgY3VycmVudEV4cG9ydCA9IGV4cG9ydHMuZ2V0KElNUE9SVF9ERUZBVUxUX1NQRUNJRklFUilcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY3VycmVudEV4cG9ydCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgY3VycmVudEV4cG9ydC53aGVyZVVzZWQuZGVsZXRlKGZpbGUpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICBuZXdOYW1lc3BhY2VJbXBvcnRzLmZvckVhY2godmFsdWUgPT4ge1xuICAgICAgICBpZiAoIW9sZE5hbWVzcGFjZUltcG9ydHMuaGFzKHZhbHVlKSkge1xuICAgICAgICAgIGxldCBpbXBvcnRzID0gb2xkSW1wb3J0UGF0aHMuZ2V0KHZhbHVlKVxuICAgICAgICAgIGlmICh0eXBlb2YgaW1wb3J0cyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGltcG9ydHMgPSBuZXcgU2V0KClcbiAgICAgICAgICB9XG4gICAgICAgICAgaW1wb3J0cy5hZGQoSU1QT1JUX05BTUVTUEFDRV9TUEVDSUZJRVIpXG4gICAgICAgICAgb2xkSW1wb3J0UGF0aHMuc2V0KHZhbHVlLCBpbXBvcnRzKVxuXG4gICAgICAgICAgbGV0IGV4cG9ydHMgPSBleHBvcnRMaXN0LmdldCh2YWx1ZSlcbiAgICAgICAgICBsZXQgY3VycmVudEV4cG9ydFxuICAgICAgICAgIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGN1cnJlbnRFeHBvcnQgPSBleHBvcnRzLmdldChJTVBPUlRfTkFNRVNQQUNFX1NQRUNJRklFUilcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXhwb3J0cyA9IG5ldyBNYXAoKVxuICAgICAgICAgICAgZXhwb3J0TGlzdC5zZXQodmFsdWUsIGV4cG9ydHMpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHR5cGVvZiBjdXJyZW50RXhwb3J0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgY3VycmVudEV4cG9ydC53aGVyZVVzZWQuYWRkKGZpbGUpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHdoZXJlVXNlZCA9IG5ldyBTZXQoKVxuICAgICAgICAgICAgd2hlcmVVc2VkLmFkZChmaWxlKVxuICAgICAgICAgICAgZXhwb3J0cy5zZXQoSU1QT1JUX05BTUVTUEFDRV9TUEVDSUZJRVIsIHsgd2hlcmVVc2VkIH0pXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICBvbGROYW1lc3BhY2VJbXBvcnRzLmZvckVhY2godmFsdWUgPT4ge1xuICAgICAgICBpZiAoIW5ld05hbWVzcGFjZUltcG9ydHMuaGFzKHZhbHVlKSkge1xuICAgICAgICAgIGNvbnN0IGltcG9ydHMgPSBvbGRJbXBvcnRQYXRocy5nZXQodmFsdWUpXG4gICAgICAgICAgaW1wb3J0cy5kZWxldGUoSU1QT1JUX05BTUVTUEFDRV9TUEVDSUZJRVIpXG5cbiAgICAgICAgICBjb25zdCBleHBvcnRzID0gZXhwb3J0TGlzdC5nZXQodmFsdWUpXG4gICAgICAgICAgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgY29uc3QgY3VycmVudEV4cG9ydCA9IGV4cG9ydHMuZ2V0KElNUE9SVF9OQU1FU1BBQ0VfU1BFQ0lGSUVSKVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBjdXJyZW50RXhwb3J0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICBjdXJyZW50RXhwb3J0LndoZXJlVXNlZC5kZWxldGUoZmlsZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIG5ld0ltcG9ydHMuZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xuICAgICAgICBpZiAoIW9sZEltcG9ydHMuaGFzKGtleSkpIHtcbiAgICAgICAgICBsZXQgaW1wb3J0cyA9IG9sZEltcG9ydFBhdGhzLmdldCh2YWx1ZSlcbiAgICAgICAgICBpZiAodHlwZW9mIGltcG9ydHMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBpbXBvcnRzID0gbmV3IFNldCgpXG4gICAgICAgICAgfVxuICAgICAgICAgIGltcG9ydHMuYWRkKGtleSlcbiAgICAgICAgICBvbGRJbXBvcnRQYXRocy5zZXQodmFsdWUsIGltcG9ydHMpXG5cbiAgICAgICAgICBsZXQgZXhwb3J0cyA9IGV4cG9ydExpc3QuZ2V0KHZhbHVlKVxuICAgICAgICAgIGxldCBjdXJyZW50RXhwb3J0XG4gICAgICAgICAgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgY3VycmVudEV4cG9ydCA9IGV4cG9ydHMuZ2V0KGtleSlcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXhwb3J0cyA9IG5ldyBNYXAoKVxuICAgICAgICAgICAgZXhwb3J0TGlzdC5zZXQodmFsdWUsIGV4cG9ydHMpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHR5cGVvZiBjdXJyZW50RXhwb3J0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgY3VycmVudEV4cG9ydC53aGVyZVVzZWQuYWRkKGZpbGUpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHdoZXJlVXNlZCA9IG5ldyBTZXQoKVxuICAgICAgICAgICAgd2hlcmVVc2VkLmFkZChmaWxlKVxuICAgICAgICAgICAgZXhwb3J0cy5zZXQoa2V5LCB7IHdoZXJlVXNlZCB9KVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgb2xkSW1wb3J0cy5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgIGlmICghbmV3SW1wb3J0cy5oYXMoa2V5KSkge1xuICAgICAgICAgIGNvbnN0IGltcG9ydHMgPSBvbGRJbXBvcnRQYXRocy5nZXQodmFsdWUpXG4gICAgICAgICAgaW1wb3J0cy5kZWxldGUoa2V5KVxuXG4gICAgICAgICAgY29uc3QgZXhwb3J0cyA9IGV4cG9ydExpc3QuZ2V0KHZhbHVlKVxuICAgICAgICAgIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRFeHBvcnQgPSBleHBvcnRzLmdldChrZXkpXG4gICAgICAgICAgICBpZiAodHlwZW9mIGN1cnJlbnRFeHBvcnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgIGN1cnJlbnRFeHBvcnQud2hlcmVVc2VkLmRlbGV0ZShmaWxlKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgJ1Byb2dyYW06ZXhpdCc6IG5vZGUgPT4ge1xuICAgICAgICB1cGRhdGVFeHBvcnRVc2FnZShub2RlKVxuICAgICAgICB1cGRhdGVJbXBvcnRVc2FnZShub2RlKVxuICAgICAgICBjaGVja0V4cG9ydFByZXNlbmNlKG5vZGUpXG4gICAgICB9LFxuICAgICAgJ0V4cG9ydERlZmF1bHREZWNsYXJhdGlvbic6IG5vZGUgPT4ge1xuICAgICAgICBjaGVja1VzYWdlKG5vZGUsIElNUE9SVF9ERUZBVUxUX1NQRUNJRklFUilcbiAgICAgIH0sXG4gICAgICAnRXhwb3J0TmFtZWREZWNsYXJhdGlvbic6IG5vZGUgPT4ge1xuICAgICAgICBub2RlLnNwZWNpZmllcnMuZm9yRWFjaChzcGVjaWZpZXIgPT4ge1xuICAgICAgICAgICAgY2hlY2tVc2FnZShub2RlLCBzcGVjaWZpZXIuZXhwb3J0ZWQubmFtZSlcbiAgICAgICAgfSlcbiAgICAgICAgaWYgKG5vZGUuZGVjbGFyYXRpb24pIHtcbiAgICAgICAgICBpZiAobm9kZS5kZWNsYXJhdGlvbi50eXBlID09PSBGVU5DVElPTl9ERUNMQVJBVElPTikge1xuICAgICAgICAgICAgY2hlY2tVc2FnZShub2RlLCBub2RlLmRlY2xhcmF0aW9uLmlkLm5hbWUpXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChub2RlLmRlY2xhcmF0aW9uLnR5cGUgPT09IFZBUklBQkxFX0RFQ0xBUkFUSU9OKSB7XG4gICAgICAgICAgICBub2RlLmRlY2xhcmF0aW9uLmRlY2xhcmF0aW9ucy5mb3JFYWNoKGRlY2xhcmF0aW9uID0+IHtcbiAgICAgICAgICAgICAgY2hlY2tVc2FnZShub2RlLCBkZWNsYXJhdGlvbi5pZC5uYW1lKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfVxuICB9LFxufVxuIl19