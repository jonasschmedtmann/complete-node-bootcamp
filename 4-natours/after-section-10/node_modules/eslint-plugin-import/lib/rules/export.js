'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _ExportMap = require('../ExportMap');

var _ExportMap2 = _interopRequireDefault(_ExportMap);

var _docsUrl = require('../docsUrl');

var _docsUrl2 = _interopRequireDefault(_docsUrl);

var _arrayIncludes = require('array-includes');

var _arrayIncludes2 = _interopRequireDefault(_arrayIncludes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
Notes on Typescript namespaces aka TSModuleDeclaration:

There are two forms:
- active namespaces: namespace Foo {} / module Foo {}
- ambient modules; declare module "eslint-plugin-import" {}

active namespaces:
- cannot contain a default export
- cannot contain an export all
- cannot contain a multi name export (export { a, b })
- can have active namespaces nested within them

ambient namespaces:
- can only be defined in .d.ts files
- cannot be nested within active namespaces
- have no other restrictions
*/

const rootProgram = 'root';
const tsTypePrefix = 'type:';

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      url: (0, _docsUrl2.default)('export')
    }
  },

  create: function (context) {
    const namespace = new Map([[rootProgram, new Map()]]);

    function addNamed(name, node, parent, isType) {
      if (!namespace.has(parent)) {
        namespace.set(parent, new Map());
      }
      const named = namespace.get(parent);

      const key = isType ? `${tsTypePrefix}${name}` : name;
      let nodes = named.get(key);

      if (nodes == null) {
        nodes = new Set();
        named.set(key, nodes);
      }

      nodes.add(node);
    }

    function getParent(node) {
      if (node.parent && node.parent.type === 'TSModuleBlock') {
        return node.parent.parent;
      }

      // just in case somehow a non-ts namespace export declaration isn't directly
      // parented to the root Program node
      return rootProgram;
    }

    return {
      'ExportDefaultDeclaration': node => addNamed('default', node, getParent(node)),

      'ExportSpecifier': node => addNamed(node.exported.name, node.exported, getParent(node)),

      'ExportNamedDeclaration': function (node) {
        if (node.declaration == null) return;

        const parent = getParent(node);
        // support for old typescript versions
        const isTypeVariableDecl = node.declaration.kind === 'type';

        if (node.declaration.id != null) {
          if ((0, _arrayIncludes2.default)(['TSTypeAliasDeclaration', 'TSInterfaceDeclaration'], node.declaration.type)) {
            addNamed(node.declaration.id.name, node.declaration.id, parent, true);
          } else {
            addNamed(node.declaration.id.name, node.declaration.id, parent, isTypeVariableDecl);
          }
        }

        if (node.declaration.declarations != null) {
          for (let declaration of node.declaration.declarations) {
            (0, _ExportMap.recursivePatternCapture)(declaration.id, v => addNamed(v.name, v, parent, isTypeVariableDecl));
          }
        }
      },

      'ExportAllDeclaration': function (node) {
        if (node.source == null) return; // not sure if this is ever true

        const remoteExports = _ExportMap2.default.get(node.source.value, context);
        if (remoteExports == null) return;

        if (remoteExports.errors.length) {
          remoteExports.reportErrors(context, node);
          return;
        }

        const parent = getParent(node);

        let any = false;
        remoteExports.forEach((v, name) => name !== 'default' && (any = true) && // poor man's filter
        addNamed(name, node, parent));

        if (!any) {
          context.report(node.source, `No named exports found in module '${node.source.value}'.`);
        }
      },

      'Program:exit': function () {
        for (let _ref of namespace) {
          var _ref2 = _slicedToArray(_ref, 2);

          let named = _ref2[1];

          for (let _ref3 of named) {
            var _ref4 = _slicedToArray(_ref3, 2);

            let name = _ref4[0];
            let nodes = _ref4[1];

            if (nodes.size <= 1) continue;

            for (let node of nodes) {
              if (name === 'default') {
                context.report(node, 'Multiple default exports.');
              } else {
                context.report(node, `Multiple exports of name '${name.replace(tsTypePrefix, '')}'.`);
              }
            }
          }
        }
      }
    };
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJ1bGVzL2V4cG9ydC5qcyJdLCJuYW1lcyI6WyJyb290UHJvZ3JhbSIsInRzVHlwZVByZWZpeCIsIm1vZHVsZSIsImV4cG9ydHMiLCJtZXRhIiwidHlwZSIsImRvY3MiLCJ1cmwiLCJjcmVhdGUiLCJjb250ZXh0IiwibmFtZXNwYWNlIiwiTWFwIiwiYWRkTmFtZWQiLCJuYW1lIiwibm9kZSIsInBhcmVudCIsImlzVHlwZSIsImhhcyIsInNldCIsIm5hbWVkIiwiZ2V0Iiwia2V5Iiwibm9kZXMiLCJTZXQiLCJhZGQiLCJnZXRQYXJlbnQiLCJleHBvcnRlZCIsImRlY2xhcmF0aW9uIiwiaXNUeXBlVmFyaWFibGVEZWNsIiwia2luZCIsImlkIiwiZGVjbGFyYXRpb25zIiwidiIsInNvdXJjZSIsInJlbW90ZUV4cG9ydHMiLCJFeHBvcnRNYXAiLCJ2YWx1ZSIsImVycm9ycyIsImxlbmd0aCIsInJlcG9ydEVycm9ycyIsImFueSIsImZvckVhY2giLCJyZXBvcnQiLCJzaXplIiwicmVwbGFjZSJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFtQkEsTUFBTUEsY0FBYyxNQUFwQjtBQUNBLE1BQU1DLGVBQWUsT0FBckI7O0FBRUFDLE9BQU9DLE9BQVAsR0FBaUI7QUFDZkMsUUFBTTtBQUNKQyxVQUFNLFNBREY7QUFFSkMsVUFBTTtBQUNKQyxXQUFLLHVCQUFRLFFBQVI7QUFERDtBQUZGLEdBRFM7O0FBUWZDLFVBQVEsVUFBVUMsT0FBVixFQUFtQjtBQUN6QixVQUFNQyxZQUFZLElBQUlDLEdBQUosQ0FBUSxDQUFDLENBQUNYLFdBQUQsRUFBYyxJQUFJVyxHQUFKLEVBQWQsQ0FBRCxDQUFSLENBQWxCOztBQUVBLGFBQVNDLFFBQVQsQ0FBa0JDLElBQWxCLEVBQXdCQyxJQUF4QixFQUE4QkMsTUFBOUIsRUFBc0NDLE1BQXRDLEVBQThDO0FBQzVDLFVBQUksQ0FBQ04sVUFBVU8sR0FBVixDQUFj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SUFBcEM7QUFDQTtBQUNEOztBQUVELGNBQU1DLFNBQVNVLFVBQVVYLElBQVYsQ0FBZjs7QUFFQSxZQUFJMEIsTUFBTSxLQUFWO0FBQ0FOLHNCQUFjTyxPQUFkLENBQXNCLENBQUNULENBQUQsRUFBSW5CLElBQUosS0FDcEJBLFNBQVMsU0FBVCxLQUNDMkIsTUFBTSxJQURQLEtBQ2dCO0FBQ2hCNUIsaUJBQVNDLElBQVQsRUFBZUMsSUFBZixFQUFxQkMsTUFBckIsQ0FIRjs7QUFLQSxZQUFJLENBQUN5QixHQUFMLEVBQVU7QUFDUi9CLGtCQUFRaUMsTUFBUixDQUFlNUIsS0FBS21CLE1BQXBCLEVBQ0cscUNBQW9DbkIsS0FBS21CLE1BQUwsQ0FBWUcsS0FBTSxJQUR6RDtBQUVEO0FBQ0YsT0F0REk7O0FBd0RMLHNCQUFnQixZQUFZO0FBQzFCLHlCQUFzQjFCLFNBQXRCLEVBQWlDO0FBQUE7O0FBQUEsY0FBckJTLEtBQXFCOztBQUMvQiw0QkFBMEJBLEtBQTFCLEVBQWlDO0FBQUE7O0FBQUEsZ0JBQXZCTixJQUF1QjtBQUFBLGdCQUFqQlMsS0FBaUI7O0FBQy9CLGdCQUFJQSxNQUFNcUIsSUFBTixJQUFjLENBQWxCLEVBQXFCOztBQUVyQixpQkFBSyxJQUFJN0IsSUFBVCxJQUFpQlEsS0FBakIsRUFBd0I7QUFDdEIsa0JBQUlULFNBQVMsU0FBYixFQUF3QjtBQUN0Qkosd0JBQVFpQyxNQUFSLENBQWU1QixJQUFmLEVBQXFCLDJCQUFyQjtBQUNELGVBRkQsTUFFTztBQUNMTCx3QkFBUWlDLE1BQVIsQ0FDRTVCLElBREYsRUFFRyw2QkFBNEJELEtBQUsrQixPQUFMLENBQWEzQyxZQUFiLEVBQTJCLEVBQTNCLENBQStCLElBRjlEO0FBSUQ7QUFDRjtBQUNGO0FBQ0Y7QUFDRjtBQXpFSSxLQUFQO0FBMkVEO0FBakhjLENBQWpCIiwiZmlsZSI6InJ1bGVzL2V4cG9ydC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBFeHBvcnRNYXAsIHsgcmVjdXJzaXZlUGF0dGVybkNhcHR1cmUgfSBmcm9tICcuLi9FeHBvcnRNYXAnXG5pbXBvcnQgZG9jc1VybCBmcm9tICcuLi9kb2NzVXJsJ1xuaW1wb3J0IGluY2x1ZGVzIGZyb20gJ2FycmF5LWluY2x1ZGVzJ1xuXG4vKlxuTm90ZXMgb24gVHlwZXNjcmlwdCBuYW1lc3BhY2VzIGFrYSBUU01vZHVsZURlY2xhcmF0aW9uOlxuXG5UaGVyZSBhcmUgdHdvIGZvcm1zOlxuLSBhY3RpdmUgbmFtZXNwYWNlczogbmFtZXNwYWNlIEZvbyB7fSAvIG1vZHVsZSBGb28ge31cbi0gYW1iaWVudCBtb2R1bGVzOyBkZWNsYXJlIG1vZHVsZSBcImVzbGludC1wbHVnaW4taW1wb3J0XCIge31cblxuYWN0aXZlIG5hbWVzcGFjZXM6XG4tIGNhbm5vdCBjb250YWluIGEgZGVmYXVsdCBleHBvcnRcbi0gY2Fubm90IGNvbnRhaW4gYW4gZXhwb3J0IGFsbFxuLSBjYW5ub3QgY29udGFpbiBhIG11bHRpIG5hbWUgZXhwb3J0IChleHBvcnQgeyBhLCBiIH0pXG4tIGNhbiBoYXZlIGFjdGl2ZSBuYW1lc3BhY2VzIG5lc3RlZCB3aXRoaW4gdGhlbVxuXG5hbWJpZW50IG5hbWVzcGFjZXM6XG4tIGNhbiBvbmx5IGJlIGRlZmluZWQgaW4gLmQudHMgZmlsZXNcbi0gY2Fubm90IGJlIG5lc3RlZCB3aXRoaW4gYWN0aXZlIG5hbWVzcGFjZXNcbi0gaGF2ZSBubyBvdGhlciByZXN0cmljdGlvbnNcbiovXG5cbmNvbnN0IHJvb3RQcm9ncmFtID0gJ3Jvb3QnXG5jb25zdCB0c1R5cGVQcmVmaXggPSAndHlwZTonXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBtZXRhOiB7XG4gICAgdHlwZTogJ3Byb2JsZW0nLFxuICAgIGRvY3M6IHtcbiAgICAgIHVybDogZG9jc1VybCgnZXhwb3J0JyksXG4gICAgfSxcbiAgfSxcblxuICBjcmVhdGU6IGZ1bmN0aW9uIChjb250ZXh0KSB7XG4gICAgY29uc3QgbmFtZXNwYWNlID0gbmV3IE1hcChbW3Jvb3RQcm9ncmFtLCBuZXcgTWFwKCldXSlcblxuICAgIGZ1bmN0aW9uIGFkZE5hbWVkKG5hbWUsIG5vZGUsIHBhcmVudCwgaXNUeXBlKSB7XG4gICAgICBpZiAoIW5hbWVzcGFjZS5oYXMocGFyZW50KSkge1xuICAgICAgICBuYW1lc3BhY2Uuc2V0KHBhcmVudCwgbmV3IE1hcCgpKVxuICAgICAgfVxuICAgICAgY29uc3QgbmFtZWQgPSBuYW1lc3BhY2UuZ2V0KHBhcmVudClcblxuICAgICAgY29uc3Qga2V5ID0gaXNUeXBlID8gYCR7dHNUeXBlUHJlZml4fSR7bmFtZX1gIDogbmFtZVxuICAgICAgbGV0IG5vZGVzID0gbmFtZWQuZ2V0KGtleSlcblxuICAgICAgaWYgKG5vZGVzID09IG51bGwpIHtcbiAgICAgICAgbm9kZXMgPSBuZXcgU2V0KClcbiAgICAgICAgbmFtZWQuc2V0KGtleSwgbm9kZXMpXG4gICAgICB9XG5cbiAgICAgIG5vZGVzLmFkZChub2RlKVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFBhcmVudChub2RlKSB7XG4gICAgICBpZiAobm9kZS5wYXJlbnQgJiYgbm9kZS5wYXJlbnQudHlwZSA9PT0gJ1RTTW9kdWxlQmxvY2snKSB7XG4gICAgICAgIHJldHVybiBub2RlLnBhcmVudC5wYXJlbnRcbiAgICAgIH1cblxuICAgICAgLy8ganVzdCBpbiBjYXNlIHNvbWVob3cgYSBub24tdHMgbmFtZXNwYWNlIGV4cG9ydCBkZWNsYXJhdGlvbiBpc24ndCBkaXJlY3RseVxuICAgICAgLy8gcGFyZW50ZWQgdG8gdGhlIHJvb3QgUHJvZ3JhbSBub2RlXG4gICAgICByZXR1cm4gcm9vdFByb2dyYW1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgJ0V4cG9ydERlZmF1bHREZWNsYXJhdGlvbic6IChub2RlKSA9PiBhZGROYW1lZCgnZGVmYXVsdCcsIG5vZGUsIGdldFBhcmVudChub2RlKSksXG5cbiAgICAgICdFeHBvcnRTcGVjaWZpZXInOiAobm9kZSkgPT4gYWRkTmFtZWQobm9kZS5leHBvcnRlZC5uYW1lLCBub2RlLmV4cG9ydGVkLCBnZXRQYXJlbnQobm9kZSkpLFxuXG4gICAgICAnRXhwb3J0TmFtZWREZWNsYXJhdGlvbic6IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgIGlmIChub2RlLmRlY2xhcmF0aW9uID09IG51bGwpIHJldHVyblxuXG4gICAgICAgIGNvbnN0IHBhcmVudCA9IGdldFBhcmVudChub2RlKVxuICAgICAgICAvLyBzdXBwb3J0IGZvciBvbGQgdHlwZXNjcmlwdCB2ZXJzaW9uc1xuICAgICAgICBjb25zdCBpc1R5cGVWYXJpYWJsZURlY2wgPSBub2RlLmRlY2xhcmF0aW9uLmtpbmQgPT09ICd0eXBlJ1xuXG4gICAgICAgIGlmIChub2RlLmRlY2xhcmF0aW9uLmlkICE9IG51bGwpIHtcbiAgICAgICAgICBpZiAoaW5jbHVkZXMoW1xuICAgICAgICAgICAgJ1RTVHlwZUFsaWFzRGVjbGFyYXRpb24nLFxuICAgICAgICAgICAgJ1RTSW50ZXJmYWNlRGVjbGFyYXRpb24nLFxuICAgICAgICAgIF0sIG5vZGUuZGVjbGFyYXRpb24udHlwZSkpIHtcbiAgICAgICAgICAgIGFkZE5hbWVkKG5vZGUuZGVjbGFyYXRpb24uaWQubmFtZSwgbm9kZS5kZWNsYXJhdGlvbi5pZCwgcGFyZW50LCB0cnVlKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhZGROYW1lZChub2RlLmRlY2xhcmF0aW9uLmlkLm5hbWUsIG5vZGUuZGVjbGFyYXRpb24uaWQsIHBhcmVudCwgaXNUeXBlVmFyaWFibGVEZWNsKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChub2RlLmRlY2xhcmF0aW9uLmRlY2xhcmF0aW9ucyAhPSBudWxsKSB7XG4gICAgICAgICAgZm9yIChsZXQgZGVjbGFyYXRpb24gb2Ygbm9kZS5kZWNsYXJhdGlvbi5kZWNsYXJhdGlvbnMpIHtcbiAgICAgICAgICAgIHJlY3Vyc2l2ZVBhdHRlcm5DYXB0dXJlKGRlY2xhcmF0aW9uLmlkLCB2ID0+XG4gICAgICAgICAgICAgIGFkZE5hbWVkKHYubmFtZSwgdiwgcGFyZW50LCBpc1R5cGVWYXJpYWJsZURlY2wpKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgJ0V4cG9ydEFsbERlY2xhcmF0aW9uJzogZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgaWYgKG5vZGUuc291cmNlID09IG51bGwpIHJldHVybiAvLyBub3Qgc3VyZSBpZiB0aGlzIGlzIGV2ZXIgdHJ1ZVxuXG4gICAgICAgIGNvbnN0IHJlbW90ZUV4cG9ydHMgPSBFeHBvcnRNYXAuZ2V0KG5vZGUuc291cmNlLnZhbHVlLCBjb250ZXh0KVxuICAgICAgICBpZiAocmVtb3RlRXhwb3J0cyA9PSBudWxsKSByZXR1cm5cblxuICAgICAgICBpZiAocmVtb3RlRXhwb3J0cy5lcnJvcnMubGVuZ3RoKSB7XG4gICAgICAgICAgcmVtb3RlRXhwb3J0cy5yZXBvcnRFcnJvcnMoY29udGV4dCwgbm9kZSlcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHBhcmVudCA9IGdldFBhcmVudChub2RlKVxuXG4gICAgICAgIGxldCBhbnkgPSBmYWxzZVxuICAgICAgICByZW1vdGVFeHBvcnRzLmZvckVhY2goKHYsIG5hbWUpID0+XG4gICAgICAgICAgbmFtZSAhPT0gJ2RlZmF1bHQnICYmXG4gICAgICAgICAgKGFueSA9IHRydWUpICYmIC8vIHBvb3IgbWFuJ3MgZmlsdGVyXG4gICAgICAgICAgYWRkTmFtZWQobmFtZSwgbm9kZSwgcGFyZW50KSlcblxuICAgICAgICBpZiAoIWFueSkge1xuICAgICAgICAgIGNvbnRleHQucmVwb3J0KG5vZGUuc291cmNlLFxuICAgICAgICAgICAgYE5vIG5hbWVkIGV4cG9ydHMgZm91bmQgaW4gbW9kdWxlICcke25vZGUuc291cmNlLnZhbHVlfScuYClcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgJ1Byb2dyYW06ZXhpdCc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZm9yIChsZXQgWywgbmFtZWRdIG9mIG5hbWVzcGFjZSkge1xuICAgICAgICAgIGZvciAobGV0IFtuYW1lLCBub2Rlc10gb2YgbmFtZWQpIHtcbiAgICAgICAgICAgIGlmIChub2Rlcy5zaXplIDw9IDEpIGNvbnRpbnVlXG5cbiAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2Ygbm9kZXMpIHtcbiAgICAgICAgICAgICAgaWYgKG5hbWUgPT09ICdkZWZhdWx0Jykge1xuICAgICAgICAgICAgICAgIGNvbnRleHQucmVwb3J0KG5vZGUsICdNdWx0aXBsZSBkZWZhdWx0IGV4cG9ydHMuJylcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0LnJlcG9ydChcbiAgICAgICAgICAgICAgICAgIG5vZGUsXG4gICAgICAgICAgICAgICAgICBgTXVsdGlwbGUgZXhwb3J0cyBvZiBuYW1lICcke25hbWUucmVwbGFjZSh0c1R5cGVQcmVmaXgsICcnKX0nLmBcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfVxuICB9LFxufVxuIl19