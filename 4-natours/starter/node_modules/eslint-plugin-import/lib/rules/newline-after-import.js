'use strict';




var _staticRequire = require('../core/staticRequire');var _staticRequire2 = _interopRequireDefault(_staticRequire);
var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);

var _debug = require('debug');var _debug2 = _interopRequireDefault(_debug);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}
var log = (0, _debug2['default'])('eslint-plugin-import:rules:newline-after-import');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------
/**
 * @fileoverview Rule to enforce new line after import not followed by another import.
 * @author Radek Benkel
 */function containsNodeOrEqual(outerNode, innerNode) {return outerNode.range[0] <= innerNode.range[0] && outerNode.range[1] >= innerNode.range[1];}

function getScopeBody(scope) {
  if (scope.block.type === 'SwitchStatement') {
    log('SwitchStatement scopes not supported');
    return null;
  }var

  body = scope.block.body;
  if (body && body.type === 'BlockStatement') {
    return body.body;
  }

  return body;
}

function findNodeIndexInScopeBody(body, nodeToFind) {
  return body.findIndex(function (node) {return containsNodeOrEqual(node, nodeToFind);});
}

function getLineDifference(node, nextNode) {
  return nextNode.loc.start.line - node.loc.end.line;
}

function isClassWithDecorator(node) {
  return node.type === 'ClassDeclaration' && node.decorators && node.decorators.length;
}

function isExportDefaultClass(node) {
  return node.type === 'ExportDefaultDeclaration' && node.declaration.type === 'ClassDeclaration';
}

function isExportNameClass(node) {

  return node.type === 'ExportNamedDeclaration' && node.declaration && node.declaration.type === 'ClassDeclaration';
}

module.exports = {
  meta: {
    type: 'layout',
    docs: {
      category: 'Style guide',
      description: 'Enforce a newline after import statements.',
      url: (0, _docsUrl2['default'])('newline-after-import') },

    fixable: 'whitespace',
    schema: [
    {
      type: 'object',
      properties: {
        count: {
          type: 'integer',
          minimum: 1 },

        exactCount: { type: 'boolean' },
        considerComments: { type: 'boolean' } },

      additionalProperties: false }] },



  create: function () {function create(context) {
      var level = 0;
      var requireCalls = [];
      var options = Object.assign({
        count: 1,
        exactCount: false,
        considerComments: false },
      context.options[0]);


      function checkForNewLine(node, nextNode, type) {
        if (isExportDefaultClass(nextNode) || isExportNameClass(nextNode)) {
          var classNode = nextNode.declaration;

          if (isClassWithDecorator(classNode)) {
            nextNode = classNode.decorators[0];
          }
        } else if (isClassWithDecorator(nextNode)) {
          nextNode = nextNode.decorators[0];
        }

        var lineDifference = getLineDifference(node, nextNode);
        var EXPECTED_LINE_DIFFERENCE = options.count + 1;

        if (
        lineDifference < EXPECTED_LINE_DIFFERENCE ||
        options.exactCount && lineDifference !== EXPECTED_LINE_DIFFERENCE)
        {
          var column = node.loc.start.column;

          if (node.loc.start.line !== node.loc.end.line) {
            column = 0;
          }

          context.report({
            loc: {
              line: node.loc.end.line,
              column: column },

            message: 'Expected ' + String(options.count) + ' empty line' + (options.count > 1 ? 's' : '') + ' after ' + String(type) + ' statement not followed by another ' + String(type) + '.',
            fix: options.exactCount && EXPECTED_LINE_DIFFERENCE < lineDifference ? undefined : function (fixer) {return fixer.insertTextAfter(
              node,
              '\n'.repeat(EXPECTED_LINE_DIFFERENCE - lineDifference));} });


        }
      }

      function commentAfterImport(node, nextComment) {
        var lineDifference = getLineDifference(node, nextComment);
        var EXPECTED_LINE_DIFFERENCE = options.count + 1;

        if (lineDifference < EXPECTED_LINE_DIFFERENCE) {
          var column = node.loc.start.column;

          if (node.loc.start.line !== node.loc.end.line) {
            column = 0;
          }

          context.report({
            loc: {
              line: node.loc.end.line,
              column: column },

            message: 'Expected ' + String(options.count) + ' empty line' + (options.count > 1 ? 's' : '') + ' after import statement not followed by another import.',
            fix: options.exactCount && EXPECTED_LINE_DIFFERENCE < lineDifference ? undefined : function (fixer) {return fixer.insertTextAfter(
              node,
              '\n'.repeat(EXPECTED_LINE_DIFFERENCE - lineDifference));} });


        }
      }

      function incrementLevel() {
        level++;
      }
      function decrementLevel() {
        level--;
      }

      function checkImport(node) {var
        parent = node.parent;

        if (!parent || !parent.body) {
          return;
        }

        var nodePosition = parent.body.indexOf(node);
        var nextNode = parent.body[nodePosition + 1];
        var endLine = node.loc.end.line;
        var nextComment = void 0;

        if (typeof parent.comments !== 'undefined' && options.considerComments) {
          nextComment = parent.comments.find(function (o) {return o.loc.start.line >= endLine && o.loc.start.line <= endLine + options.count + 1;});
        }

        // skip "export import"s
        if (node.type === 'TSImportEqualsDeclaration' && node.isExport) {
          return;
        }

        if (nextComment && typeof nextComment !== 'undefined') {
          commentAfterImport(node, nextComment);
        } else if (nextNode && nextNode.type !== 'ImportDeclaration' && (nextNode.type !== 'TSImportEqualsDeclaration' || nextNode.isExport)) {
          checkForNewLine(node, nextNode, 'import');
        }
      }

      return {
        ImportDeclaration: checkImport,
        TSImportEqualsDeclaration: checkImport,
        CallExpression: function () {function CallExpression(node) {
            if ((0, _staticRequire2['default'])(node) && level === 0) {
              requireCalls.push(node);
            }
          }return CallExpression;}(),
        'Program:exit': function () {function ProgramExit() {
            log('exit processing for', context.getPhysicalFilename ? context.getPhysicalFilename() : context.getFilename());
            var scopeBody = getScopeBody(context.getScope());
            log('got scope:', scopeBody);

            requireCalls.forEach(function (node, index) {
              var nodePosition = findNodeIndexInScopeBody(scopeBody, node);
              log('node position in scope:', nodePosition);

              var statementWithRequireCall = scopeBody[nodePosition];
              var nextStatement = scopeBody[nodePosition + 1];
              var nextRequireCall = requireCalls[index + 1];

              if (nextRequireCall && containsNodeOrEqual(statementWithRequireCall, nextRequireCall)) {
                return;
              }

              if (
              nextStatement && (
              !nextRequireCall ||
              !containsNodeOrEqual(nextStatement, nextRequireCall)))

              {

                checkForNewLine(statementWithRequireCall, nextStatement, 'require');
              }
            });
          }return ProgramExit;}(),
        FunctionDeclaration: incrementLevel,
        FunctionExpression: incrementLevel,
        ArrowFunctionExpression: incrementLevel,
        BlockStatement: incrementLevel,
        ObjectExpression: incrementLevel,
        Decorator: incrementLevel,
        'FunctionDeclaration:exit': decrementLevel,
        'FunctionExpression:exit': decrementLevel,
        'ArrowFunctionExpression:exit': decrementLevel,
        'BlockStatement:exit': decrementLevel,
        'ObjectExpression:exit': decrementLevel,
        'Decorator:exit': decrementLevel };

    }return create;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uZXdsaW5lLWFmdGVyLWltcG9ydC5qcyJdLCJuYW1lcyI6WyJsb2ciLCJjb250YWluc05vZGVPckVxdWFsIiwib3V0ZXJOb2RlIiwiaW5uZXJOb2RlIiwicmFuZ2UiLCJnZXRTY29wZUJvZHkiLCJzY29wZSIsImJsb2NrIiwidHlwZSIsImJvZHkiLCJmaW5kTm9kZUluZGV4SW5TY29wZUJvZHkiLCJub2RlVG9GaW5kIiwiZmluZEluZGV4Iiwibm9kZSIsImdldExpbmVEaWZmZXJlbmNlIiwibmV4dE5vZGUiLCJsb2MiLCJzdGFydCIsImxpbmUiLCJlbmQiLCJpc0NsYXNzV2l0aERlY29yYXRvciIsImRlY29yYXRvcnMiLCJsZW5ndGgiLCJpc0V4cG9ydERlZmF1bHRDbGFzcyIsImRlY2xhcmF0aW9uIiwiaXNFeHBvcnROYW1lQ2xhc3MiLCJtb2R1bGUiLCJleHBvcnRzIiwibWV0YSIsImRvY3MiLCJjYXRlZ29yeSIsImRlc2NyaXB0aW9uIiwidXJsIiwiZml4YWJsZSIsInNjaGVtYSIsInByb3BlcnRpZXMiLCJjb3VudCIsIm1pbmltdW0iLCJleGFjdENvdW50IiwiY29uc2lkZXJDb21tZW50cyIsImFkZGl0aW9uYWxQcm9wZXJ0aWVzIiwiY3JlYXRlIiwiY29udGV4dCIsImxldmVsIiwicmVxdWlyZUNhbGxzIiwib3B0aW9ucyIsImNoZWNrRm9yTmV3TGluZSIsImNsYXNzTm9kZSIsImxpbmVEaWZmZXJlbmNlIiwiRVhQRUNURURfTElORV9ESUZGRVJFTkNFIiwiY29sdW1uIiwicmVwb3J0IiwibWVzc2FnZSIsImZpeCIsInVuZGVmaW5lZCIsImZpeGVyIiwiaW5zZXJ0VGV4dEFmdGVyIiwicmVwZWF0IiwiY29tbWVudEFmdGVySW1wb3J0IiwibmV4dENvbW1lbnQiLCJpbmNyZW1lbnRMZXZlbCIsImRlY3JlbWVudExldmVsIiwiY2hlY2tJbXBvcnQiLCJwYXJlbnQiLCJub2RlUG9zaXRpb24iLCJpbmRleE9mIiwiZW5kTGluZSIsImNvbW1lbnRzIiwiZmluZCIsIm8iLCJpc0V4cG9ydCIsIkltcG9ydERlY2xhcmF0aW9uIiwiVFNJbXBvcnRFcXVhbHNEZWNsYXJhdGlvbiIsIkNhbGxFeHByZXNzaW9uIiwicHVzaCIsImdldFBoeXNpY2FsRmlsZW5hbWUiLCJnZXRGaWxlbmFtZSIsInNjb3BlQm9keSIsImdldFNjb3BlIiwiZm9yRWFjaCIsImluZGV4Iiwic3RhdGVtZW50V2l0aFJlcXVpcmVDYWxsIiwibmV4dFN0YXRlbWVudCIsIm5leHRSZXF1aXJlQ2FsbCIsIkZ1bmN0aW9uRGVjbGFyYXRpb24iLCJGdW5jdGlvbkV4cHJlc3Npb24iLCJBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbiIsIkJsb2NrU3RhdGVtZW50IiwiT2JqZWN0RXhwcmVzc2lvbiIsIkRlY29yYXRvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFLQSxzRDtBQUNBLHFDOztBQUVBLDhCO0FBQ0EsSUFBTUEsTUFBTSx3QkFBTSxpREFBTixDQUFaOztBQUVBO0FBQ0E7QUFDQTtBQWJBOzs7R0FlQSxTQUFTQyxtQkFBVCxDQUE2QkMsU0FBN0IsRUFBd0NDLFNBQXhDLEVBQW1ELENBQ2pELE9BQU9ELFVBQVVFLEtBQVYsQ0FBZ0IsQ0FBaEIsS0FBc0JELFVBQVVDLEtBQVYsQ0FBZ0IsQ0FBaEIsQ0FBdEIsSUFBNENGLFVBQVVFLEtBQVYsQ0FBZ0IsQ0FBaEIsS0FBc0JELFVBQVVDLEtBQVYsQ0FBZ0IsQ0FBaEIsQ0FBekUsQ0FDRDs7QUFFRCxTQUFTQyxZQUFULENBQXNCQyxLQUF0QixFQUE2QjtBQUMzQixNQUFJQSxNQUFNQyxLQUFOLENBQVlDLElBQVosS0FBcUIsaUJBQXpCLEVBQTRDO0FBQzFDUixRQUFJLHNDQUFKO0FBQ0EsV0FBTyxJQUFQO0FBQ0QsR0FKMEI7O0FBTW5CUyxNQU5tQixHQU1WSCxNQUFNQyxLQU5JLENBTW5CRSxJQU5tQjtBQU8zQixNQUFJQSxRQUFRQSxLQUFLRCxJQUFMLEtBQWMsZ0JBQTFCLEVBQTRDO0FBQzFDLFdBQU9DLEtBQUtBLElBQVo7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Qm1FLFNBQXpCLEVBQW9DaEUsSUFBcEMsQ0FBckI7QUFDQWIsa0JBQUkseUJBQUosRUFBK0JnRSxZQUEvQjs7QUFFQSxrQkFBTWlCLDJCQUEyQkosVUFBVWIsWUFBVixDQUFqQztBQUNBLGtCQUFNa0IsZ0JBQWdCTCxVQUFVYixlQUFlLENBQXpCLENBQXRCO0FBQ0Esa0JBQU1tQixrQkFBa0J2QyxhQUFhb0MsUUFBUSxDQUFyQixDQUF4Qjs7QUFFQSxrQkFBSUcsbUJBQW1CbEYsb0JBQW9CZ0Ysd0JBQXBCLEVBQThDRSxlQUE5QyxDQUF2QixFQUF1RjtBQUNyRjtBQUNEOztBQUVEO0FBQ0VEO0FBQ0UsZUFBQ0MsZUFBRDtBQUNHLGVBQUNsRixvQkFBb0JpRixhQUFwQixFQUFtQ0MsZUFBbkMsQ0FGTixDQURGOztBQUtFOztBQUVBckMsZ0NBQWdCbUMsd0JBQWhCLEVBQTBDQyxhQUExQyxFQUF5RCxTQUF6RDtBQUNEO0FBQ0YsYUFyQkQ7QUFzQkQsV0FuQ0k7QUFvQ0xFLDZCQUFxQnhCLGNBcENoQjtBQXFDTHlCLDRCQUFvQnpCLGNBckNmO0FBc0NMMEIsaUNBQXlCMUIsY0F0Q3BCO0FBdUNMMkIsd0JBQWdCM0IsY0F2Q1g7QUF3Q0w0QiwwQkFBa0I1QixjQXhDYjtBQXlDTDZCLG1CQUFXN0IsY0F6Q047QUEwQ0wsb0NBQTRCQyxjQTFDdkI7QUEyQ0wsbUNBQTJCQSxjQTNDdEI7QUE0Q0wsd0NBQWdDQSxjQTVDM0I7QUE2Q0wsK0JBQXVCQSxjQTdDbEI7QUE4Q0wsaUNBQXlCQSxjQTlDcEI7QUErQ0wsMEJBQWtCQSxjQS9DYixFQUFQOztBQWlERCxLQXJMYyxtQkFBakIiLCJmaWxlIjoibmV3bGluZS1hZnRlci1pbXBvcnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgUnVsZSB0byBlbmZvcmNlIG5ldyBsaW5lIGFmdGVyIGltcG9ydCBub3QgZm9sbG93ZWQgYnkgYW5vdGhlciBpbXBvcnQuXG4gKiBAYXV0aG9yIFJhZGVrIEJlbmtlbFxuICovXG5cbmltcG9ydCBpc1N0YXRpY1JlcXVpcmUgZnJvbSAnLi4vY29yZS9zdGF0aWNSZXF1aXJlJztcbmltcG9ydCBkb2NzVXJsIGZyb20gJy4uL2RvY3NVcmwnO1xuXG5pbXBvcnQgZGVidWcgZnJvbSAnZGVidWcnO1xuY29uc3QgbG9nID0gZGVidWcoJ2VzbGludC1wbHVnaW4taW1wb3J0OnJ1bGVzOm5ld2xpbmUtYWZ0ZXItaW1wb3J0Jyk7XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBSdWxlIERlZmluaXRpb25cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmZ1bmN0aW9uIGNvbnRhaW5zTm9kZU9yRXF1YWwob3V0ZXJOb2RlLCBpbm5lck5vZGUpIHtcbiAgcmV0dXJuIG91dGVyTm9kZS5yYW5nZVswXSA8PSBpbm5lck5vZGUucmFuZ2VbMF0gJiYgb3V0ZXJOb2RlLnJhbmdlWzFdID49IGlubmVyTm9kZS5yYW5nZVsxXTtcbn1cblxuZnVuY3Rpb24gZ2V0U2NvcGVCb2R5KHNjb3BlKSB7XG4gIGlmIChzY29wZS5ibG9jay50eXBlID09PSAnU3dpdGNoU3RhdGVtZW50Jykge1xuICAgIGxvZygnU3dpdGNoU3RhdGVtZW50IHNjb3BlcyBub3Qgc3VwcG9ydGVkJyk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjb25zdCB7IGJvZHkgfSA9IHNjb3BlLmJsb2NrO1xuICBpZiAoYm9keSAmJiBib2R5LnR5cGUgPT09ICdCbG9ja1N0YXRlbWVudCcpIHtcbiAgICByZXR1cm4gYm9keS5ib2R5O1xuICB9XG5cbiAgcmV0dXJuIGJvZHk7XG59XG5cbmZ1bmN0aW9uIGZpbmROb2RlSW5kZXhJblNjb3BlQm9keShib2R5LCBub2RlVG9GaW5kKSB7XG4gIHJldHVybiBib2R5LmZpbmRJbmRleCgobm9kZSkgPT4gY29udGFpbnNOb2RlT3JFcXVhbChub2RlLCBub2RlVG9GaW5kKSk7XG59XG5cbmZ1bmN0aW9uIGdldExpbmVEaWZmZXJlbmNlKG5vZGUsIG5leHROb2RlKSB7XG4gIHJldHVybiBuZXh0Tm9kZS5sb2Muc3RhcnQubGluZSAtIG5vZGUubG9jLmVuZC5saW5lO1xufVxuXG5mdW5jdGlvbiBpc0NsYXNzV2l0aERlY29yYXRvcihub2RlKSB7XG4gIHJldHVybiBub2RlLnR5cGUgPT09ICdDbGFzc0RlY2xhcmF0aW9uJyAmJiBub2RlLmRlY29yYXRvcnMgJiYgbm9kZS5kZWNvcmF0b3JzLmxlbmd0aDtcbn1cblxuZnVuY3Rpb24gaXNFeHBvcnREZWZhdWx0Q2xhc3Mobm9kZSkge1xuICByZXR1cm4gbm9kZS50eXBlID09PSAnRXhwb3J0RGVmYXVsdERlY2xhcmF0aW9uJyAmJiBub2RlLmRlY2xhcmF0aW9uLnR5cGUgPT09ICdDbGFzc0RlY2xhcmF0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNFeHBvcnROYW1lQ2xhc3Mobm9kZSkge1xuXG4gIHJldHVybiBub2RlLnR5cGUgPT09ICdFeHBvcnROYW1lZERlY2xhcmF0aW9uJyAmJiBub2RlLmRlY2xhcmF0aW9uICYmIG5vZGUuZGVjbGFyYXRpb24udHlwZSA9PT0gJ0NsYXNzRGVjbGFyYXRpb24nO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbWV0YToge1xuICAgIHR5cGU6ICdsYXlvdXQnLFxuICAgIGRvY3M6IHtcbiAgICAgIGNhdGVnb3J5OiAnU3R5bGUgZ3VpZGUnLFxuICAgICAgZGVzY3JpcHRpb246ICdFbmZvcmNlIGEgbmV3bGluZSBhZnRlciBpbXBvcnQgc3RhdGVtZW50cy4nLFxuICAgICAgdXJsOiBkb2NzVXJsKCduZXdsaW5lLWFmdGVyLWltcG9ydCcpLFxuICAgIH0sXG4gICAgZml4YWJsZTogJ3doaXRlc3BhY2UnLFxuICAgIHNjaGVtYTogW1xuICAgICAge1xuICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgIGNvdW50OiB7XG4gICAgICAgICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICAgICAgICBtaW5pbXVtOiAxLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgZXhhY3RDb3VudDogeyB0eXBlOiAnYm9vbGVhbicgfSxcbiAgICAgICAgICBjb25zaWRlckNvbW1lbnRzOiB7IHR5cGU6ICdib29sZWFuJyB9LFxuICAgICAgICB9LFxuICAgICAgICBhZGRpdGlvbmFsUHJvcGVydGllczogZmFsc2UsXG4gICAgICB9LFxuICAgIF0sXG4gIH0sXG4gIGNyZWF0ZShjb250ZXh0KSB7XG4gICAgbGV0IGxldmVsID0gMDtcbiAgICBjb25zdCByZXF1aXJlQ2FsbHMgPSBbXTtcbiAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgY291bnQ6IDEsXG4gICAgICBleGFjdENvdW50OiBmYWxzZSxcbiAgICAgIGNvbnNpZGVyQ29tbWVudHM6IGZhbHNlLFxuICAgICAgLi4uY29udGV4dC5vcHRpb25zWzBdLFxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBjaGVja0Zvck5ld0xpbmUobm9kZSwgbmV4dE5vZGUsIHR5cGUpIHtcbiAgICAgIGlmIChpc0V4cG9ydERlZmF1bHRDbGFzcyhuZXh0Tm9kZSkgfHwgaXNFeHBvcnROYW1lQ2xhc3MobmV4dE5vZGUpKSB7XG4gICAgICAgIGNvbnN0IGNsYXNzTm9kZSA9IG5leHROb2RlLmRlY2xhcmF0aW9uO1xuXG4gICAgICAgIGlmIChpc0NsYXNzV2l0aERlY29yYXRvcihjbGFzc05vZGUpKSB7XG4gICAgICAgICAgbmV4dE5vZGUgPSBjbGFzc05vZGUuZGVjb3JhdG9yc1swXTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChpc0NsYXNzV2l0aERlY29yYXRvcihuZXh0Tm9kZSkpIHtcbiAgICAgICAgbmV4dE5vZGUgPSBuZXh0Tm9kZS5kZWNvcmF0b3JzWzBdO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBsaW5lRGlmZmVyZW5jZSA9IGdldExpbmVEaWZmZXJlbmNlKG5vZGUsIG5leHROb2RlKTtcbiAgICAgIGNvbnN0IEVYUEVDVEVEX0xJTkVfRElGRkVSRU5DRSA9IG9wdGlvbnMuY291bnQgKyAxO1xuXG4gICAgICBpZiAoXG4gICAgICAgIGxpbmVEaWZmZXJlbmNlIDwgRVhQRUNURURfTElORV9ESUZGRVJFTkNFXG4gICAgICAgIHx8IG9wdGlvbnMuZXhhY3RDb3VudCAmJiBsaW5lRGlmZmVyZW5jZSAhPT0gRVhQRUNURURfTElORV9ESUZGRVJFTkNFXG4gICAgICApIHtcbiAgICAgICAgbGV0IGNvbHVtbiA9IG5vZGUubG9jLnN0YXJ0LmNvbHVtbjtcblxuICAgICAgICBpZiAobm9kZS5sb2Muc3RhcnQubGluZSAhPT0gbm9kZS5sb2MuZW5kLmxpbmUpIHtcbiAgICAgICAgICBjb2x1bW4gPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgY29udGV4dC5yZXBvcnQoe1xuICAgICAgICAgIGxvYzoge1xuICAgICAgICAgICAgbGluZTogbm9kZS5sb2MuZW5kLmxpbmUsXG4gICAgICAgICAgICBjb2x1bW4sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBtZXNzYWdlOiBgRXhwZWN0ZWQgJHtvcHRpb25zLmNvdW50fSBlbXB0eSBsaW5lJHtvcHRpb25zLmNvdW50ID4gMSA/ICdzJyA6ICcnfSBhZnRlciAke3R5cGV9IHN0YXRlbWVudCBub3QgZm9sbG93ZWQgYnkgYW5vdGhlciAke3R5cGV9LmAsXG4gICAgICAgICAgZml4OiBvcHRpb25zLmV4YWN0Q291bnQgJiYgRVhQRUNURURfTElORV9ESUZGRVJFTkNFIDwgbGluZURpZmZlcmVuY2UgPyB1bmRlZmluZWQgOiAoZml4ZXIpID0+IGZpeGVyLmluc2VydFRleHRBZnRlcihcbiAgICAgICAgICAgIG5vZGUsXG4gICAgICAgICAgICAnXFxuJy5yZXBlYXQoRVhQRUNURURfTElORV9ESUZGRVJFTkNFIC0gbGluZURpZmZlcmVuY2UpLFxuICAgICAgICAgICksXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNvbW1lbnRBZnRlckltcG9ydChub2RlLCBuZXh0Q29tbWVudCkge1xuICAgICAgY29uc3QgbGluZURpZmZlcmVuY2UgPSBnZXRMaW5lRGlmZmVyZW5jZShub2RlLCBuZXh0Q29tbWVudCk7XG4gICAgICBjb25zdCBFWFBFQ1RFRF9MSU5FX0RJRkZFUkVOQ0UgPSBvcHRpb25zLmNvdW50ICsgMTtcblxuICAgICAgaWYgKGxpbmVEaWZmZXJlbmNlIDwgRVhQRUNURURfTElORV9ESUZGRVJFTkNFKSB7XG4gICAgICAgIGxldCBjb2x1bW4gPSBub2RlLmxvYy5zdGFydC5jb2x1bW47XG5cbiAgICAgICAgaWYgKG5vZGUubG9jLnN0YXJ0LmxpbmUgIT09IG5vZGUubG9jLmVuZC5saW5lKSB7XG4gICAgICAgICAgY29sdW1uID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRleHQucmVwb3J0KHtcbiAgICAgICAgICBsb2M6IHtcbiAgICAgICAgICAgIGxpbmU6IG5vZGUubG9jLmVuZC5saW5lLFxuICAgICAgICAgICAgY29sdW1uLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgbWVzc2FnZTogYEV4cGVjdGVkICR7b3B0aW9ucy5jb3VudH0gZW1wdHkgbGluZSR7b3B0aW9ucy5jb3VudCA+IDEgPyAncycgOiAnJ30gYWZ0ZXIgaW1wb3J0IHN0YXRlbWVudCBub3QgZm9sbG93ZWQgYnkgYW5vdGhlciBpbXBvcnQuYCxcbiAgICAgICAgICBmaXg6IG9wdGlvbnMuZXhhY3RDb3VudCAmJiBFWFBFQ1RFRF9MSU5FX0RJRkZFUkVOQ0UgPCBsaW5lRGlmZmVyZW5jZSA/IHVuZGVmaW5lZCA6IChmaXhlcikgPT4gZml4ZXIuaW5zZXJ0VGV4dEFmdGVyKFxuICAgICAgICAgICAgbm9kZSxcbiAgICAgICAgICAgICdcXG4nLnJlcGVhdChFWFBFQ1RFRF9MSU5FX0RJRkZFUkVOQ0UgLSBsaW5lRGlmZmVyZW5jZSksXG4gICAgICAgICAgKSxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5jcmVtZW50TGV2ZWwoKSB7XG4gICAgICBsZXZlbCsrO1xuICAgIH1cbiAgICBmdW5jdGlvbiBkZWNyZW1lbnRMZXZlbCgpIHtcbiAgICAgIGxldmVsLS07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2hlY2tJbXBvcnQobm9kZSkge1xuICAgICAgY29uc3QgeyBwYXJlbnQgfSA9IG5vZGU7XG5cbiAgICAgIGlmICghcGFyZW50IHx8ICFwYXJlbnQuYm9keSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG5vZGVQb3NpdGlvbiA9IHBhcmVudC5ib2R5LmluZGV4T2Yobm9kZSk7XG4gICAgICBjb25zdCBuZXh0Tm9kZSA9IHBhcmVudC5ib2R5W25vZGVQb3NpdGlvbiArIDFdO1xuICAgICAgY29uc3QgZW5kTGluZSA9IG5vZGUubG9jLmVuZC5saW5lO1xuICAgICAgbGV0IG5leHRDb21tZW50O1xuXG4gICAgICBpZiAodHlwZW9mIHBhcmVudC5jb21tZW50cyAhPT0gJ3VuZGVmaW5lZCcgJiYgb3B0aW9ucy5jb25zaWRlckNvbW1lbnRzKSB7XG4gICAgICAgIG5leHRDb21tZW50ID0gcGFyZW50LmNvbW1lbnRzLmZpbmQoKG8pID0+IG8ubG9jLnN0YXJ0LmxpbmUgPj0gZW5kTGluZSAmJiBvLmxvYy5zdGFydC5saW5lIDw9IGVuZExpbmUgKyBvcHRpb25zLmNvdW50ICsgMSk7XG4gICAgICB9XG5cbiAgICAgIC8vIHNraXAgXCJleHBvcnQgaW1wb3J0XCJzXG4gICAgICBpZiAobm9kZS50eXBlID09PSAnVFNJbXBvcnRFcXVhbHNEZWNsYXJhdGlvbicgJiYgbm9kZS5pc0V4cG9ydCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChuZXh0Q29tbWVudCAmJiB0eXBlb2YgbmV4dENvbW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGNvbW1lbnRBZnRlckltcG9ydChub2RlLCBuZXh0Q29tbWVudCk7XG4gICAgICB9IGVsc2UgaWYgKG5leHROb2RlICYmIG5leHROb2RlLnR5cGUgIT09ICdJbXBvcnREZWNsYXJhdGlvbicgJiYgKG5leHROb2RlLnR5cGUgIT09ICdUU0ltcG9ydEVxdWFsc0RlY2xhcmF0aW9uJyB8fCBuZXh0Tm9kZS5pc0V4cG9ydCkpIHtcbiAgICAgICAgY2hlY2tGb3JOZXdMaW5lKG5vZGUsIG5leHROb2RlLCAnaW1wb3J0Jyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIEltcG9ydERlY2xhcmF0aW9uOiBjaGVja0ltcG9ydCxcbiAgICAgIFRTSW1wb3J0RXF1YWxzRGVjbGFyYXRpb246IGNoZWNrSW1wb3J0LFxuICAgICAgQ2FsbEV4cHJlc3Npb24obm9kZSkge1xuICAgICAgICBpZiAoaXNTdGF0aWNSZXF1aXJlKG5vZGUpICYmIGxldmVsID09PSAwKSB7XG4gICAgICAgICAgcmVxdWlyZUNhbGxzLnB1c2gobm9kZSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICAnUHJvZ3JhbTpleGl0JygpIHtcbiAgICAgICAgbG9nKCdleGl0IHByb2Nlc3NpbmcgZm9yJywgY29udGV4dC5nZXRQaHlzaWNhbEZpbGVuYW1lID8gY29udGV4dC5nZXRQaHlzaWNhbEZpbGVuYW1lKCkgOiBjb250ZXh0LmdldEZpbGVuYW1lKCkpO1xuICAgICAgICBjb25zdCBzY29wZUJvZHkgPSBnZXRTY29wZUJvZHkoY29udGV4dC5nZXRTY29wZSgpKTtcbiAgICAgICAgbG9nKCdnb3Qgc2NvcGU6Jywgc2NvcGVCb2R5KTtcblxuICAgICAgICByZXF1aXJlQ2FsbHMuZm9yRWFjaCgobm9kZSwgaW5kZXgpID0+IHtcbiAgICAgICAgICBjb25zdCBub2RlUG9zaXRpb24gPSBmaW5kTm9kZUluZGV4SW5TY29wZUJvZHkoc2NvcGVCb2R5LCBub2RlKTtcbiAgICAgICAgICBsb2coJ25vZGUgcG9zaXRpb24gaW4gc2NvcGU6Jywgbm9kZVBvc2l0aW9uKTtcblxuICAgICAgICAgIGNvbnN0IHN0YXRlbWVudFdpdGhSZXF1aXJlQ2FsbCA9IHNjb3BlQm9keVtub2RlUG9zaXRpb25dO1xuICAgICAgICAgIGNvbnN0IG5leHRTdGF0ZW1lbnQgPSBzY29wZUJvZHlbbm9kZVBvc2l0aW9uICsgMV07XG4gICAgICAgICAgY29uc3QgbmV4dFJlcXVpcmVDYWxsID0gcmVxdWlyZUNhbGxzW2luZGV4ICsgMV07XG5cbiAgICAgICAgICBpZiAobmV4dFJlcXVpcmVDYWxsICYmIGNvbnRhaW5zTm9kZU9yRXF1YWwoc3RhdGVtZW50V2l0aFJlcXVpcmVDYWxsLCBuZXh0UmVxdWlyZUNhbGwpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgbmV4dFN0YXRlbWVudCAmJiAoXG4gICAgICAgICAgICAgICFuZXh0UmVxdWlyZUNhbGxcbiAgICAgICAgICAgICAgfHwgIWNvbnRhaW5zTm9kZU9yRXF1YWwobmV4dFN0YXRlbWVudCwgbmV4dFJlcXVpcmVDYWxsKVxuICAgICAgICAgICAgKVxuICAgICAgICAgICkge1xuXG4gICAgICAgICAgICBjaGVja0Zvck5ld0xpbmUoc3RhdGVtZW50V2l0aFJlcXVpcmVDYWxsLCBuZXh0U3RhdGVtZW50LCAncmVxdWlyZScpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgRnVuY3Rpb25EZWNsYXJhdGlvbjogaW5jcmVtZW50TGV2ZWwsXG4gICAgICBGdW5jdGlvbkV4cHJlc3Npb246IGluY3JlbWVudExldmVsLFxuICAgICAgQXJyb3dGdW5jdGlvbkV4cHJlc3Npb246IGluY3JlbWVudExldmVsLFxuICAgICAgQmxvY2tTdGF0ZW1lbnQ6IGluY3JlbWVudExldmVsLFxuICAgICAgT2JqZWN0RXhwcmVzc2lvbjogaW5jcmVtZW50TGV2ZWwsXG4gICAgICBEZWNvcmF0b3I6IGluY3JlbWVudExldmVsLFxuICAgICAgJ0Z1bmN0aW9uRGVjbGFyYXRpb246ZXhpdCc6IGRlY3JlbWVudExldmVsLFxuICAgICAgJ0Z1bmN0aW9uRXhwcmVzc2lvbjpleGl0JzogZGVjcmVtZW50TGV2ZWwsXG4gICAgICAnQXJyb3dGdW5jdGlvbkV4cHJlc3Npb246ZXhpdCc6IGRlY3JlbWVudExldmVsLFxuICAgICAgJ0Jsb2NrU3RhdGVtZW50OmV4aXQnOiBkZWNyZW1lbnRMZXZlbCxcbiAgICAgICdPYmplY3RFeHByZXNzaW9uOmV4aXQnOiBkZWNyZW1lbnRMZXZlbCxcbiAgICAgICdEZWNvcmF0b3I6ZXhpdCc6IGRlY3JlbWVudExldmVsLFxuICAgIH07XG4gIH0sXG59O1xuIl19