'use strict';

var _declaredScope = require('eslint-module-utils/declaredScope');

var _declaredScope2 = _interopRequireDefault(_declaredScope);

var _ExportMap = require('../ExportMap');

var _ExportMap2 = _interopRequireDefault(_ExportMap);

var _importDeclaration = require('../importDeclaration');

var _importDeclaration2 = _interopRequireDefault(_importDeclaration);

var _docsUrl = require('../docsUrl');

var _docsUrl2 = _interopRequireDefault(_docsUrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      url: (0, _docsUrl2.default)('namespace')
    },

    schema: [{
      'type': 'object',
      'properties': {
        'allowComputed': {
          'description': 'If `false`, will report computed (and thus, un-lintable) references ' + 'to namespace members.',
          'type': 'boolean',
          'default': false
        }
      },
      'additionalProperties': false
    }]
  },

  create: function namespaceRule(context) {

    // read options
    var _ref = context.options[0] || {},
        _ref$allowComputed = _ref.allowComputed;

    const allowComputed = _ref$allowComputed === undefined ? false : _ref$allowComputed;


    const namespaces = new Map();

    function makeMessage(last, namepath) {
      return `'${last.name}' not found in` + (namepath.length > 1 ? ' deeply ' : ' ') + `imported namespace '${namepath.join('.')}'.`;
    }

    return {

      // pick up all imports at body entry time, to properly respect hoisting
      Program: function (_ref2) {
        let body = _ref2.body;

        function processBodyStatement(declaration) {
          if (declaration.type !== 'ImportDeclaration') return;

          if (declaration.specifiers.length === 0) return;

          const imports = _ExportMap2.default.get(declaration.source.value, context);
          if (imports == null) return null;

          if (imports.errors.length) {
            imports.reportErrors(context, declaration);
            return;
          }

          for (const specifier of declaration.specifiers) {
            switch (specifier.type) {
              case 'ImportNamespaceSpecifier':
                if (!imports.size) {
                  context.report(specifier, `No exported names found in module '${declaration.source.value}'.`);
                }
                namespaces.set(specifier.local.name, imports);
                break;
              case 'ImportDefaultSpecifier':
              case 'ImportSpecifier':
                {
                  const meta = imports.get(
                  // default to 'default' for default http://i.imgur.com/nj6qAWy.jpg
                  specifier.imported ? specifier.imported.name : 'default');
                  if (!meta || !meta.namespace) break;
                  namespaces.set(specifier.local.name, meta.namespace);
                  break;
                }
            }
          }
        }
        body.forEach(processBodyStatement);
      },

      // same as above, but does not add names to local map
      ExportNamespaceSpecifier: function (namespace) {
        var declaration = (0, _importDeclaration2.default)(context);

        var imports = _ExportMap2.default.get(declaration.source.value, context);
        if (imports == null) return null;

        if (imports.errors.length) {
          imports.reportErrors(context, declaration);
          return;
        }

        if (!imports.size) {
          context.report(namespace, `No exported names found in module '${declaration.source.value}'.`);
        }
      },

      // todo: check for possible redefinition

      MemberExpression: function (dereference) {
        if (dereference.object.type !== 'Identifier') return;
        if (!namespaces.has(dereference.object.name)) return;

        if (dereference.parent.type === 'AssignmentExpression' && dereference.parent.left === dereference) {
          context.report(dereference.parent, `Assignment to member of namespace '${dereference.object.name}'.`);
        }

        // go deep
        var namespace = namespaces.get(dereference.object.name);
        var namepath = [dereference.object.name];
        // while property is namespace and parent is member expression, keep validating
        while (namespace instanceof _ExportMap2.default && dereference.type === 'MemberExpression') {

          if (dereference.computed) {
            if (!allowComputed) {
              context.report(dereference.property, 'Unable to validate computed reference to imported namespace \'' + dereference.object.name + '\'.');
            }
            return;
          }

          if (!namespace.has(dereference.property.name)) {
            context.report(dereference.property, makeMessage(dereference.property, namepath));
            break;
          }

          const exported = namespace.get(dereference.property.name);
          if (exported == null) return;

          // stash and pop
          namepath.push(dereference.property.name);
          namespace = exported.namespace;
          dereference = dereference.parent;
        }
      },

      VariableDeclarator: function (_ref3) {
        let id = _ref3.id,
            init = _ref3.init;

        if (init == null) return;
        if (init.type !== 'Identifier') return;
        if (!namespaces.has(init.name)) return;

        // check for redefinition in intermediate scopes
        if ((0, _declaredScope2.default)(context, init.name) !== 'module') return;

        // DFS traverse child namespaces
        function testKey(pattern, namespace) {
          let path = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [init.name];

          if (!(namespace instanceof _ExportMap2.default)) return;

          if (pattern.type !== 'ObjectPattern') return;

          for (const property of pattern.properties) {
            if (property.type === 'ExperimentalRestProperty' || property.type === 'RestElement' || !property.key) {
              continue;
            }

            if (property.key.type !== 'Identifier') {
              context.report({
                node: property,
                message: 'Only destructure top-level names.'
              });
              continue;
            }

            if (!namespace.has(property.key.name)) {
              context.report({
                node: property,
                message: makeMessage(property.key, path)
              });
              continue;
            }

            path.push(property.key.name);
            const dependencyExportMap = namespace.get(property.key.name);
            // could be null when ignored or ambiguous
            if (dependencyExportMap !== null) {
              testKey(property.value, dependencyExportMap.namespace, path);
            }
            path.pop();
          }
        }

        testKey(id, namespaces.get(init.name));
      },

      JSXMemberExpression: function (_ref4) {
        let object = _ref4.object,
            property = _ref4.property;

        if (!namespaces.has(object.name)) return;
        var namespace = namespaces.get(object.name);
        if (!namespace.has(property.name)) {
          context.report({
            node: property,
            message: makeMessage(property, [object.name])
          });
        }
      }
    };
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJ1bGVzL25hbWVzcGFjZS5qcyJdLCJuYW1lcyI6WyJtb2R1bGUiLCJleHBvcnRzIiwibWV0YSIsInR5cGUiLCJkb2NzIiwidXJsIiwic2NoZW1hIiwiY3JlYXRlIiwibmFtZXNwYWNlUnVsZSIsImNvbnRleHQiLCJvcHRpb25zIiwiYWxsb3dDb21wdXRlZCIsIm5hbWVzcGFjZXMiLCJNYXAiLCJtYWtlTWVzc2FnZSIsImxhc3QiLCJuYW1lcGF0aCIsIm5hbWUiLCJsZW5ndGgiLCJqb2luIiwiUHJvZ3JhbSIsImJvZHkiLCJwcm9jZXNzQm9keVN0YXRlbWVudCIsImRlY2xhcmF0aW9uIiwic3BlY2lmaWVycyIsImltcG9ydHMiLCJFeHBvcnRzIiwiZ2V0Iiwic291cmNlIiwidmFsdWUiLCJlcnJvcnMiLCJyZXBvcnRFcnJvcnMiLCJzcGVjaWZpZXIiLCJzaXplIiwicmVwb3J0Iiwic2V0IiwibG9jYWwiLCJpbXBvcnRlZCIsIm5hbWVzcGFjZSIsImZvckVhY2giLCJFeHBvcnROYW1lc3BhY2VTcGVjaWZpZXIiLCJNZW1iZXJFeHByZXNzaW9uIiwiZGVyZWZlcmVuY2UiLCJvYmplY3QiLCJoYXMiLCJwYXJlbnQiLCJsZWZ0IiwiY29tcHV0ZWQiLCJwcm9wZXJ0eSIsImV4cG9ydGVkIiwicHVzaCIsIlZhcmlhYmxlRGVjbGFyYXRvciIsImlkIiwiaW5pdCIsInRlc3RLZXkiLCJwYXR0ZXJuIiwicGF0aCIsInByb3BlcnRpZXMiLCJrZXkiLCJub2RlIiwibWVzc2FnZSIsImRlcGVuZGVuY3lFeHBvcnRNYXAiLCJwb3AiLCJKU1hNZW1iZXJFeHByZXNzaW9uIl0sIm1hcHBpbmdzIjoiOztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQUEsT0FBT0MsT0FBUCxHQUFpQjtBQUNmQyxRQUFNO0FBQ0pDLFVBQU0sU0FERjtBQUVKQyxVQUFNO0FBQ0pDLFdBQUssdUJBQVEsV0FBUjtBQURELEtBRkY7O0FBTUpDLFlBQVEsQ0FDTjtBQUNFLGNBQVEs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O0FBQ0EsWUFBSSxDQUFDcUIsVUFBVU0sR0FBVixDQUFjSSxTQUFTL0IsSUFBdkIsQ0FBTCxFQUFtQztBQUNqQ1Isa0JBQVF5QixNQUFSLENBQWU7QUFDYnlCLGtCQUFNWCxRQURPO0FBRWJZLHFCQUFTOUMsWUFBWWtDLFFBQVosRUFBc0IsQ0FBQ0wsT0FBTzFCLElBQVIsQ0FBdEI7QUFGSSxXQUFmO0FBSUQ7QUFDSDtBQXRLSSxLQUFQO0FBd0tEO0FBL01jLENBQWpCIiwiZmlsZSI6InJ1bGVzL25hbWVzcGFjZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBkZWNsYXJlZFNjb3BlIGZyb20gJ2VzbGludC1tb2R1bGUtdXRpbHMvZGVjbGFyZWRTY29wZSdcbmltcG9ydCBFeHBvcnRzIGZyb20gJy4uL0V4cG9ydE1hcCdcbmltcG9ydCBpbXBvcnREZWNsYXJhdGlvbiBmcm9tICcuLi9pbXBvcnREZWNsYXJhdGlvbidcbmltcG9ydCBkb2NzVXJsIGZyb20gJy4uL2RvY3NVcmwnXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBtZXRhOiB7XG4gICAgdHlwZTogJ3Byb2JsZW0nLFxuICAgIGRvY3M6IHtcbiAgICAgIHVybDogZG9jc1VybCgnbmFtZXNwYWNlJyksXG4gICAgfSxcblxuICAgIHNjaGVtYTogW1xuICAgICAge1xuICAgICAgICAndHlwZSc6ICdvYmplY3QnLFxuICAgICAgICAncHJvcGVydGllcyc6IHtcbiAgICAgICAgICAnYWxsb3dDb21wdXRlZCc6IHtcbiAgICAgICAgICAgICdkZXNjcmlwdGlvbic6XG4gICAgICAgICAgICAgICdJZiBgZmFsc2VgLCB3aWxsIHJlcG9ydCBjb21wdXRlZCAoYW5kIHRodXMsIHVuLWxpbnRhYmxlKSByZWZlcmVuY2VzICcgK1xuICAgICAgICAgICAgICAndG8gbmFtZXNwYWNlIG1lbWJlcnMuJyxcbiAgICAgICAgICAgICd0eXBlJzogJ2Jvb2xlYW4nLFxuICAgICAgICAgICAgJ2RlZmF1bHQnOiBmYWxzZSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICAnYWRkaXRpb25hbFByb3BlcnRpZXMnOiBmYWxzZSxcbiAgICAgIH0sXG4gICAgXSxcbiAgfSxcblxuICBjcmVhdGU6IGZ1bmN0aW9uIG5hbWVzcGFjZVJ1bGUoY29udGV4dCkge1xuXG4gICAgLy8gcmVhZCBvcHRpb25zXG4gICAgY29uc3Qge1xuICAgICAgYWxsb3dDb21wdXRlZCA9IGZhbHNlLFxuICAgIH0gPSBjb250ZXh0Lm9wdGlvbnNbMF0gfHwge31cblxuICAgIGNvbnN0IG5hbWVzcGFjZXMgPSBuZXcgTWFwKClcblxuICAgIGZ1bmN0aW9uIG1ha2VNZXNzYWdlKGxhc3QsIG5hbWVwYXRoKSB7XG4gICAgICAgcmV0dXJuIGAnJHtsYXN0Lm5hbWV9JyBub3QgZm91bmQgaW5gICtcbiAgICAgICAgICAgICAgKG5hbWVwYXRoLmxlbmd0aCA+IDEgPyAnIGRlZXBseSAnIDogJyAnKSArXG4gICAgICAgICAgICAgIGBpbXBvcnRlZCBuYW1lc3BhY2UgJyR7bmFtZXBhdGguam9pbignLicpfScuYFxuICAgIH1cblxuICAgIHJldHVybiB7XG5cbiAgICAgIC8vIHBpY2sgdXAgYWxsIGltcG9ydHMgYXQgYm9keSBlbnRyeSB0aW1lLCB0byBwcm9wZXJseSByZXNwZWN0IGhvaXN0aW5nXG4gICAgICBQcm9ncmFtOiBmdW5jdGlvbiAoeyBib2R5IH0pIHtcbiAgICAgICAgZnVuY3Rpb24gcHJvY2Vzc0JvZHlTdGF0ZW1lbnQoZGVjbGFyYXRpb24pIHtcbiAgICAgICAgICBpZiAoZGVjbGFyYXRpb24udHlwZSAhPT0gJ0ltcG9ydERlY2xhcmF0aW9uJykgcmV0dXJuXG5cbiAgICAgICAgICBpZiAoZGVjbGFyYXRpb24uc3BlY2lmaWVycy5sZW5ndGggPT09IDApIHJldHVyblxuXG4gICAgICAgICAgY29uc3QgaW1wb3J0cyA9IEV4cG9ydHMuZ2V0KGRlY2xhcmF0aW9uLnNvdXJjZS52YWx1ZSwgY29udGV4dClcbiAgICAgICAgICBpZiAoaW1wb3J0cyA9PSBudWxsKSByZXR1cm4gbnVsbFxuXG4gICAgICAgICAgaWYgKGltcG9ydHMuZXJyb3JzLmxlbmd0aCkge1xuICAgICAgICAgICAgaW1wb3J0cy5yZXBvcnRFcnJvcnMoY29udGV4dCwgZGVjbGFyYXRpb24pXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBmb3IgKGNvbnN0IHNwZWNpZmllciBvZiBkZWNsYXJhdGlvbi5zcGVjaWZpZXJzKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHNwZWNpZmllci50eXBlKSB7XG4gICAgICAgICAgICAgIGNhc2UgJ0ltcG9ydE5hbWVzcGFjZVNwZWNpZmllcic6XG4gICAgICAgICAgICAgICAgaWYgKCFpbXBvcnRzLnNpemUpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnRleHQucmVwb3J0KHNwZWNpZmllcixcbiAgICAgICAgICAgICAgICAgICAgYE5vIGV4cG9ydGVkIG5hbWVzIGZvdW5kIGluIG1vZHVsZSAnJHtkZWNsYXJhdGlvbi5zb3VyY2UudmFsdWV9Jy5gKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBuYW1lc3BhY2VzLnNldChzcGVjaWZpZXIubG9jYWwubmFtZSwgaW1wb3J0cylcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICBjYXNlICdJbXBvcnREZWZhdWx0U3BlY2lmaWVyJzpcbiAgICAgICAgICAgICAgY2FzZSAnSW1wb3J0U3BlY2lmaWVyJzoge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1ldGEgPSBpbXBvcnRzLmdldChcbiAgICAgICAgICAgICAgICAgIC8vIGRlZmF1bHQgdG8gJ2RlZmF1bHQnIGZvciBkZWZhdWx0IGh0dHA6Ly9pLmltZ3VyLmNvbS9uajZxQVd5LmpwZ1xuICAgICAgICAgICAgICAgICAgc3BlY2lmaWVyLmltcG9ydGVkID8gc3BlY2lmaWVyLmltcG9ydGVkLm5hbWUgOiAnZGVmYXVsdCcpXG4gICAgICAgICAgICAgICAgaWYgKCFtZXRhIHx8ICFtZXRhLm5hbWVzcGFjZSkgYnJlYWtcbiAgICAgICAgICAgICAgICBuYW1lc3BhY2VzLnNldChzcGVjaWZpZXIubG9jYWwubmFtZSwgbWV0YS5uYW1lc3BhY2UpXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBib2R5LmZvckVhY2gocHJvY2Vzc0JvZHlTdGF0ZW1lbnQpXG4gICAgICB9LFxuXG4gICAgICAvLyBzYW1lIGFzIGFib3ZlLCBidXQgZG9lcyBub3QgYWRkIG5hbWVzIHRvIGxvY2FsIG1hcFxuICAgICAgRXhwb3J0TmFtZXNwYWNlU3BlY2lmaWVyOiBmdW5jdGlvbiAobmFtZXNwYWNlKSB7XG4gICAgICAgIHZhciBkZWNsYXJhdGlvbiA9IGltcG9ydERlY2xhcmF0aW9uKGNvbnRleHQpXG5cbiAgICAgICAgdmFyIGltcG9ydHMgPSBFeHBvcnRzLmdldChkZWNsYXJhdGlvbi5zb3VyY2UudmFsdWUsIGNvbnRleHQpXG4gICAgICAgIGlmIChpbXBvcnRzID09IG51bGwpIHJldHVybiBudWxsXG5cbiAgICAgICAgaWYgKGltcG9ydHMuZXJyb3JzLmxlbmd0aCkge1xuICAgICAgICAgIGltcG9ydHMucmVwb3J0RXJyb3JzKGNvbnRleHQsIGRlY2xhcmF0aW9uKVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFpbXBvcnRzLnNpemUpIHtcbiAgICAgICAgICBjb250ZXh0LnJlcG9ydChuYW1lc3BhY2UsXG4gICAgICAgICAgICBgTm8gZXhwb3J0ZWQgbmFtZXMgZm91bmQgaW4gbW9kdWxlICcke2RlY2xhcmF0aW9uLnNvdXJjZS52YWx1ZX0nLmApXG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIC8vIHRvZG86IGNoZWNrIGZvciBwb3NzaWJsZSByZWRlZmluaXRpb25cblxuICAgICAgTWVtYmVyRXhwcmVzc2lvbjogZnVuY3Rpb24gKGRlcmVmZXJlbmNlKSB7XG4gICAgICAgIGlmIChkZXJlZmVyZW5jZS5vYmplY3QudHlwZSAhPT0gJ0lkZW50aWZpZXInKSByZXR1cm5cbiAgICAgICAgaWYgKCFuYW1lc3BhY2VzLmhhcyhkZXJlZmVyZW5jZS5vYmplY3QubmFtZSkpIHJldHVyblxuXG4gICAgICAgIGlmIChkZXJlZmVyZW5jZS5wYXJlbnQudHlwZSA9PT0gJ0Fzc2lnbm1lbnRFeHByZXNzaW9uJyAmJlxuICAgICAgICAgICAgZGVyZWZlcmVuY2UucGFyZW50LmxlZnQgPT09IGRlcmVmZXJlbmNlKSB7XG4gICAgICAgICAgICBjb250ZXh0LnJlcG9ydChkZXJlZmVyZW5jZS5wYXJlbnQsXG4gICAgICAgICAgICAgICAgYEFzc2lnbm1lbnQgdG8gbWVtYmVyIG9mIG5hbWVzcGFjZSAnJHtkZXJlZmVyZW5jZS5vYmplY3QubmFtZX0nLmApXG4gICAgICAgIH1cblxuICAgICAgICAvLyBnbyBkZWVwXG4gICAgICAgIHZhciBuYW1lc3BhY2UgPSBuYW1lc3BhY2VzLmdldChkZXJlZmVyZW5jZS5vYmplY3QubmFtZSlcbiAgICAgICAgdmFyIG5hbWVwYXRoID0gW2RlcmVmZXJlbmNlLm9iamVjdC5uYW1lXVxuICAgICAgICAvLyB3aGlsZSBwcm9wZXJ0eSBpcyBuYW1lc3BhY2UgYW5kIHBhcmVudCBpcyBtZW1iZXIgZXhwcmVzc2lvbiwga2VlcCB2YWxpZGF0aW5nXG4gICAgICAgIHdoaWxlIChuYW1lc3BhY2UgaW5zdGFuY2VvZiBFeHBvcnRzICYmXG4gICAgICAgICAgICAgICBkZXJlZmVyZW5jZS50eXBlID09PSAnTWVtYmVyRXhwcmVzc2lvbicpIHtcblxuICAgICAgICAgIGlmIChkZXJlZmVyZW5jZS5jb21wdXRlZCkge1xuICAgICAgICAgICAgaWYgKCFhbGxvd0NvbXB1dGVkKSB7XG4gICAgICAgICAgICAgIGNvbnRleHQucmVwb3J0KGRlcmVmZXJlbmNlLnByb3BlcnR5LFxuICAgICAgICAgICAgICAgICdVbmFibGUgdG8gdmFsaWRhdGUgY29tcHV0ZWQgcmVmZXJlbmNlIHRvIGltcG9ydGVkIG5hbWVzcGFjZSBcXCcnICtcbiAgICAgICAgICAgICAgICBkZXJlZmVyZW5jZS5vYmplY3QubmFtZSArICdcXCcuJylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICghbmFtZXNwYWNlLmhhcyhkZXJlZmVyZW5jZS5wcm9wZXJ0eS5uYW1lKSkge1xuICAgICAgICAgICAgY29udGV4dC5yZXBvcnQoXG4gICAgICAgICAgICAgIGRlcmVmZXJlbmNlLnByb3BlcnR5LFxuICAgICAgICAgICAgICBtYWtlTWVzc2FnZShkZXJlZmVyZW5jZS5wcm9wZXJ0eSwgbmFtZXBhdGgpKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBleHBvcnRlZCA9IG5hbWVzcGFjZS5nZXQoZGVyZWZlcmVuY2UucHJvcGVydHkubmFtZSlcbiAgICAgICAgICBpZiAoZXhwb3J0ZWQgPT0gbnVsbCkgcmV0dXJuXG5cbiAgICAgICAgICAvLyBzdGFzaCBhbmQgcG9wXG4gICAgICAgICAgbmFtZXBhdGgucHVzaChkZXJlZmVyZW5jZS5wcm9wZXJ0eS5uYW1lKVxuICAgICAgICAgIG5hbWVzcGFjZSA9IGV4cG9ydGVkLm5hbWVzcGFjZVxuICAgICAgICAgIGRlcmVmZXJlbmNlID0gZGVyZWZlcmVuY2UucGFyZW50XG4gICAgICAgIH1cblxuICAgICAgfSxcblxuICAgICAgVmFyaWFibGVEZWNsYXJhdG9yOiBmdW5jdGlvbiAoeyBpZCwgaW5pdCB9KSB7XG4gICAgICAgIGlmIChpbml0ID09IG51bGwpIHJldHVyblxuICAgICAgICBpZiAoaW5pdC50eXBlICE9PSAnSWRlbnRpZmllcicpIHJldHVyblxuICAgICAgICBpZiAoIW5hbWVzcGFjZXMuaGFzKGluaXQubmFtZSkpIHJldHVyblxuXG4gICAgICAgIC8vIGNoZWNrIGZvciByZWRlZmluaXRpb24gaW4gaW50ZXJtZWRpYXRlIHNjb3Blc1xuICAgICAgICBpZiAoZGVjbGFyZWRTY29wZShjb250ZXh0LCBpbml0Lm5hbWUpICE9PSAnbW9kdWxlJykgcmV0dXJuXG5cbiAgICAgICAgLy8gREZTIHRyYXZlcnNlIGNoaWxkIG5hbWVzcGFjZXNcbiAgICAgICAgZnVuY3Rpb24gdGVzdEtleShwYXR0ZXJuLCBuYW1lc3BhY2UsIHBhdGggPSBbaW5pdC5uYW1lXSkge1xuICAgICAgICAgIGlmICghKG5hbWVzcGFjZSBpbnN0YW5jZW9mIEV4cG9ydHMpKSByZXR1cm5cblxuICAgICAgICAgIGlmIChwYXR0ZXJuLnR5cGUgIT09ICdPYmplY3RQYXR0ZXJuJykgcmV0dXJuXG5cbiAgICAgICAgICBmb3IgKGNvbnN0IHByb3BlcnR5IG9mIHBhdHRlcm4ucHJvcGVydGllcykge1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICBwcm9wZXJ0eS50eXBlID09PSAnRXhwZXJpbWVudGFsUmVzdFByb3BlcnR5J1xuICAgICAgICAgICAgICB8fCBwcm9wZXJ0eS50eXBlID09PSAnUmVzdEVsZW1lbnQnXG4gICAgICAgICAgICAgIHx8ICFwcm9wZXJ0eS5rZXlcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocHJvcGVydHkua2V5LnR5cGUgIT09ICdJZGVudGlmaWVyJykge1xuICAgICAgICAgICAgICBjb250ZXh0LnJlcG9ydCh7XG4gICAgICAgICAgICAgICAgbm9kZTogcHJvcGVydHksXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogJ09ubHkgZGVzdHJ1Y3R1cmUgdG9wLWxldmVsIG5hbWVzLicsXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghbmFtZXNwYWNlLmhhcyhwcm9wZXJ0eS5rZXkubmFtZSkpIHtcbiAgICAgICAgICAgICAgY29udGV4dC5yZXBvcnQoe1xuICAgICAgICAgICAgICAgIG5vZGU6IHByb3BlcnR5LFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IG1ha2VNZXNzYWdlKHByb3BlcnR5LmtleSwgcGF0aCksXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHBhdGgucHVzaChwcm9wZXJ0eS5rZXkubmFtZSlcbiAgICAgICAgICAgIGNvbnN0IGRlcGVuZGVuY3lFeHBvcnRNYXAgPSBuYW1lc3BhY2UuZ2V0KHByb3BlcnR5LmtleS5uYW1lKVxuICAgICAgICAgICAgLy8gY291bGQgYmUgbnVsbCB3aGVuIGlnbm9yZWQgb3IgYW1iaWd1b3VzXG4gICAgICAgICAgICBpZiAoZGVwZW5kZW5jeUV4cG9ydE1hcCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICB0ZXN0S2V5KHByb3BlcnR5LnZhbHVlLCBkZXBlbmRlbmN5RXhwb3J0TWFwLm5hbWVzcGFjZSwgcGF0aClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhdGgucG9wKClcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0ZXN0S2V5KGlkLCBuYW1lc3BhY2VzLmdldChpbml0Lm5hbWUpKVxuICAgICAgfSxcblxuICAgICAgSlNYTWVtYmVyRXhwcmVzc2lvbjogZnVuY3Rpb24oe29iamVjdCwgcHJvcGVydHl9KSB7XG4gICAgICAgICBpZiAoIW5hbWVzcGFjZXMuaGFzKG9iamVjdC5uYW1lKSkgcmV0dXJuXG4gICAgICAgICB2YXIgbmFtZXNwYWNlID0gbmFtZXNwYWNlcy5nZXQob2JqZWN0Lm5hbWUpXG4gICAgICAgICBpZiAoIW5hbWVzcGFjZS5oYXMocHJvcGVydHkubmFtZSkpIHtcbiAgICAgICAgICAgY29udGV4dC5yZXBvcnQoe1xuICAgICAgICAgICAgIG5vZGU6IHByb3BlcnR5LFxuICAgICAgICAgICAgIG1lc3NhZ2U6IG1ha2VNZXNzYWdlKHByb3BlcnR5LCBbb2JqZWN0Lm5hbWVdKSxcbiAgICAgICAgICAgfSlcbiAgICAgICAgIH1cbiAgICAgIH0sXG4gICAgfVxuICB9LFxufVxuIl19