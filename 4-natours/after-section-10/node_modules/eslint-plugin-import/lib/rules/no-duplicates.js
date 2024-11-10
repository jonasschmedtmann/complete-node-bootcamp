'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _resolve = require('eslint-module-utils/resolve');

var _resolve2 = _interopRequireDefault(_resolve);

var _docsUrl = require('../docsUrl');

var _docsUrl2 = _interopRequireDefault(_docsUrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function checkImports(imported, context) {
  for (const _ref of imported.entries()) {
    var _ref2 = _slicedToArray(_ref, 2);

    const module = _ref2[0];
    const nodes = _ref2[1];

    if (nodes.length > 1) {
      const message = `'${module}' imported multiple times.`;

      var _nodes = _toArray(nodes);

      const first = _nodes[0],
            rest = _nodes.slice(1);

      const sourceCode = context.getSourceCode();
      const fix = getFix(first, rest, sourceCode);

      context.report({
        node: first.source,
        message,
        fix // Attach the autofix (if any) to the first import.
      });

      for (const node of rest) {
        context.report({
          node: node.source,
          message
        });
      }
    }
  }
}

function getFix(first, rest, sourceCode) {
  // Sorry ESLint <= 3 users, no autofix for you. Autofixing duplicate imports
  // requires multiple `fixer.whatever()` calls in the `fix`: We both need to
  // update the first one, and remove the rest. Support for multiple
  // `fixer.whatever()` in a single `fix` was added in ESLint 4.1.
  // `sourceCode.getCommentsBefore` was added in 4.0, so that's an easy thing to
  // check for.
  if (typeof sourceCode.getCommentsBefore !== 'function') {
    return undefined;
  }

  // Adjusting the first import might make it multiline, which could break
  // `eslint-disable-next-line` comments and similar, so bail if the first
  // import has comments. Also, if the first import is `import * as ns from
  // './foo'` there's nothing we can do.
  if (hasProblematicComments(first, sourceCode) || hasNamespace(first)) {
    return undefined;
  }

  const defaultImportNames = new Set([first].concat(_toConsumableArray(rest)).map(getDefaultImportName).filter(Boolean));

  // Bail if there are multiple different default import names – it's up to the
  // user to choose which one to keep.
  if (defaultImportNames.size > 1) {
    return undefined;
  }

  // Leave it to the user to handle comments. Also skip `import * as ns from
  // './foo'` imports, since they cannot be merged into another import.
  const restWithoutComments = rest.filter(node => !(hasProblematicComments(node, sourceCode) || hasNamespace(node)));

  const specifiers = restWithoutComments.map(node => {
    const tokens = sourceCode.getTokens(node);
    const openBrace = tokens.find(token => isPunctuator(token, '{'));
    const closeBrace = tokens.find(token => isPunctuator(token, '}'));

    if (openBrace == null || closeBrace == null) {
      return undefined;
    }

    return {
      importNode: node,
      text: sourceCode.text.slice(openBrace.range[1], closeBrace.range[0]),
      hasTrailingComma: isPunctuator(sourceCode.getTokenBefore(closeBrace), ','),
      isEmpty: !hasSpecifiers(node)
    };
  }).filter(Boolean);

  const unnecessaryImports = restWithoutComments.filter(node => !hasSpecifiers(node) && !hasNamespace(node) && !specifiers.some(specifier => specifier.importNode === node));

  const shouldAddDefault = getDefaultImportName(first) == null && defaultImportNames.size === 1;
  const shouldAddSpecifiers = specifiers.length > 0;
  const shouldRemoveUnnecessary = unnecessaryImports.length > 0;

  if (!(shouldAddDefault || shouldAddSpecifiers || shouldRemoveUnnecessary)) {
    return undefined;
  }

  return fixer => {
    const tokens = sourceCode.getTokens(first);
    const openBrace = tokens.find(token => isPunctuator(token, '{'));
    const closeBrace = tokens.find(token => isPunctuator(token, '}'));
    const firstToken = sourceCode.getFirstToken(first);

    var _defaultImportNames = _slicedToArray(defaultImportNames, 1);

    const defaultImportName = _defaultImportNames[0];


    const firstHasTrailingComma = closeBrace != null && isPunctuator(sourceCode.getTokenBefore(closeBrace), ',');
    const firstIsEmpty = !hasSpecifiers(first);

    var _specifiers$reduce = specifiers.reduce((_ref3, specifier) => {
      var _ref4 = _slicedToArray(_ref3, 2);

      let result = _ref4[0],
          needsComma = _ref4[1];

      return [needsComma && !specifier.isEmpty ? `${result},${specifier.text}` : `${result}${specifier.text}`, specifier.isEmpty ? needsComma : true];
    }, ['', !firstHasTrailingComma && !firstIsEmpty]),
        _specifiers$reduce2 = _slicedToArray(_specifiers$reduce, 1);

    const specifiersText = _specifiers$reduce2[0];


    const fixes = [];

    if (shouldAddDefault && openBrace == null && shouldAddSpecifiers) {
      // `import './foo'` → `import def, {...} from './foo'`
      fixes.push(fixer.insertTextAfter(firstToken, ` ${defaultImportName}, {${specifiersText}} from`));
    } else if (shouldAddDefault && openBrace == null && !shouldAddSpecifiers) {
      // `import './foo'` → `import def from './foo'`
      fixes.push(fixer.insertTextAfter(firstToken, ` ${defaultImportName} from`));
    } else if (shouldAddDefault && openBrace != null && closeBrace != null) {
      // `import {...} from './foo'` → `import def, {...} from './foo'`
      fixes.push(fixer.insertTextAfter(firstToken, ` ${defaultImportName},`));
      if (shouldAddSpecifiers) {
        // `import def, {...} from './foo'` → `import def, {..., ...} from './foo'`
        fixes.push(fixer.insertTextBefore(closeBrace, specifiersText));
      }
    } else if (!shouldAddDefault && openBrace == null && shouldAddSpecifiers) {
      // `import './foo'` → `import {...} from './foo'`
      fixes.push(fixer.insertTextAfter(firstToken, ` {${specifiersText}} from`));
    } else if (!shouldAddDefault && openBrace != null && closeBrace != null) {
      // `import {...} './foo'` → `import {..., ...} from './foo'`
      fixes.push(fixer.insertTextBefore(closeBrace, specifiersText));
    }

    // Remove imports whose specifiers have been moved into the first import.
    for (const specifier of specifiers) {
      fixes.push(fixer.remove(specifier.importNode));
    }

    // Remove imports whose default import has been moved to the first import,
    // and side-effect-only imports that are unnecessary due to the first
    // import.
    for (const node of unnecessaryImports) {
      fixes.push(fixer.remove(node));
    }

    return fixes;
  };
}

function isPunctuator(node, value) {
  return node.type === 'Punctuator' && node.value === value;
}

// Get the name of the default import of `node`, if any.
function getDefaultImportName(node) {
  const defaultSpecifier = node.specifiers.find(specifier => specifier.type === 'ImportDefaultSpecifier');
  return defaultSpecifier != null ? defaultSpecifier.local.name : undefined;
}

// Checks whether `node` has a namespace import.
function hasNamespace(node) {
  const specifiers = node.specifiers.filter(specifier => specifier.type === 'ImportNamespaceSpecifier');
  return specifiers.length > 0;
}

// Checks whether `node` has any non-default specifiers.
function hasSpecifiers(node) {
  const specifiers = node.specifiers.filter(specifier => specifier.type === 'ImportSpecifier');
  return specifiers.length > 0;
}

// It's not obvious what the user wants to do with comments associated with
// duplicate imports, so skip imports with comments when autofixing.
function hasProblematicComments(node, sourceCode) {
  return hasCommentBefore(node, sourceCode) || hasCommentAfter(node, sourceCode) || hasCommentInsideNonSpecifiers(node, sourceCode);
}

// Checks whether `node` has a comment (that ends) on the previous line or on
// the same line as `node` (starts).
function hasCommentBefore(node, sourceCode) {
  return sourceCode.getCommentsBefore(node).some(comment => comment.loc.end.line >= node.loc.start.line - 1);
}

// Checks whether `node` has a comment (that starts) on the same line as `node`
// (ends).
function hasCommentAfter(node, sourceCode) {
  return sourceCode.getCommentsAfter(node).some(comment => comment.loc.start.line === node.loc.end.line);
}

// Checks whether `node` has any comments _inside,_ except inside the `{...}`
// part (if any).
function hasCommentInsideNonSpecifiers(node, sourceCode) {
  const tokens = sourceCode.getTokens(node);
  const openBraceIndex = tokens.findIndex(token => isPunctuator(token, '{'));
  const closeBraceIndex = tokens.findIndex(token => isPunctuator(token, '}'));
  // Slice away the first token, since we're no looking for comments _before_
  // `node` (only inside). If there's a `{...}` part, look for comments before
  // the `{`, but not before the `}` (hence the `+1`s).
  const someTokens = openBraceIndex >= 0 && closeBraceIndex >= 0 ? tokens.slice(1, openBraceIndex + 1).concat(tokens.slice(closeBraceIndex + 1)) : tokens.slice(1);
  return someTokens.some(token => sourceCode.getCommentsBefore(token).length > 0);
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      url: (0, _docsUrl2.default)('no-duplicates')
    },
    fixable: 'code'
  },

  create: function (context) {
    const imported = new Map();
    const typesImported = new Map();
    return {
      'ImportDeclaration': function (n) {
        // resolved path will cover aliased duplicates
        const resolvedPath = (0, _resolve2.default)(n.source.value, context) || n.source.value;
        const importMap = n.importKind === 'type' ? typesImported : imported;

        if (importMap.has(resolvedPath)) {
          importMap.get(resolvedPath).push(n);
        } else {
          importMap.set(resolvedPath, [n]);
        }
      },

      'Program:exit': function () {
        checkImports(imported, context);
        checkImports(typesImported, context);
      }
    };
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJ1bGVzL25vLWR1cGxpY2F0ZXMuanMiXSwibmFtZXMiOlsiY2hlY2tJbXBvcnRzIiwiaW1wb3J0ZWQiLCJjb250ZXh0IiwiZW50cmllcyIsIm1vZHVsZSIsIm5vZGVzIiwibGVuZ3RoIiwibWVzc2FnZSIsImZpcnN0IiwicmVzdCIsInNvdXJjZUNvZGUiLCJnZXRTb3VyY2VDb2RlIiwiZml4IiwiZ2V0Rml4IiwicmVwb3J0Iiwibm9kZSIsInNvdXJjZSIsImdldENvbW1lbnRzQmVmb3JlIiwidW5kZWZpbmVkIiwiaGFzUHJvYmxlbWF0aWNDb21tZW50cyIsImhhc05hbWVzcGFjZSIsImRlZmF1bHRJbXBvcnROYW1lcyIsIlNldCIsIm1hcCIsImdldERlZmF1bHRJbXBvcnROYW1lIiwiZmlsdGVyIiwiQm9vbGVhbiIsInNpemUiLCJyZXN0V2l0aG91dENvbW1lbnRzIiwic3BlY2lmaWVycyIsInRva2VucyIsImdldFRva2VucyIsIm9wZW5CcmFjZSIsImZpbmQiLCJ0b2tlbiIsImlzUHVuY3R1YXRvciIsImNsb3NlQnJhY2UiLCJpbXBvcnROb2RlIiwidGV4dCIsInNsaWNlIiwicmFuZ2UiLCJoYXNUcmFpbGluZ0NvbW1hIiwiZ2V0VG9rZW5CZWZvcmUiLCJpc0VtcHR5IiwiaGFzU3BlY2lmaWVycyIsInVubmVjZXNzYXJ5SW1wb3J0cyIsInNvbWUiLCJzcGVjaWZpZXIiLCJzaG91bGRBZGREZWZhdWx0Iiwic2hvdWxkQWRkU3BlY2lmaWVycyIsInNob3VsZFJlbW92ZVVubmVjZXNzYXJ5IiwiZml4ZXIiLCJmaXJzdFRva2VuIiwiZ2V0Rmlyc3RUb2tlbiIsImRlZmF1bHRJbXBvcnROYW1lIiwiZmlyc3RIYXNUcmFpbGluZ0NvbW1hIiwiZmlyc3RJc0VtcHR5IiwicmVkdWNlIiwicmVzdWx0IiwibmVlZHNDb21tYSIsInNwZWNpZmllcnNUZXh0IiwiZml4ZXMiLCJwdXNoIiwiaW5zZXJ0VGV4dEFmdGVyIiwiaW5zZXJ0VGV4dEJlZm9yZSIsInJlbW92ZSIsInZhbHVlIiwidHlwZSIsImRlZmF1bHRTcGVjaWZpZXIiLCJsb2NhbCIsIm5hbWUiLCJoYXNDb21tZW50QmVmb3JlIiwiaGFzQ29tbWVudEFmdGVyIiwiaGFzQ29tbWVudEluc2lkZU5vblNwZWNpZmllcnMiLCJjb21tZW50IiwibG9jIiwiZW5kIiwibGluZSIsInN0YXJ0IiwiZ2V0Q29tbWVudHNBZnRlciIsIm9wZW5CcmFjZUluZGV4IiwiZmluZEluZGV4IiwiY2xvc2VCcmFjZUluZGV4Iiwic29tZVRva2VucyIsImNvbmNhdCIsImV4cG9ydHMiLCJtZXRhIiwiZG9jcyIsInVybCIsImZpeGFibGUiLCJjcmVhdGUiLCJNYXAiLCJ0eXBlc0ltcG9ydGVkIiwibiIsInJlc29sdmVkUGF0aCIsImltcG9ydE1hcCIsImltcG9ydEtpbmQiLCJoYXMiLCJnZXQiLCJzZXQiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTs7OztBQUNBOzs7Ozs7Ozs7O0FBRUEsU0FBU0EsWUFBVCxDQUFzQkMsUUFBdEIsRUFBZ0NDLE9BQWhDLEVBQXlDO0FBQ3ZDLHFCQUE4QkQsU0FBU0UsT0FBVCxFQUE5QixFQUFrRDtBQUFBOztBQUFBLFVBQXRDQyxNQUFzQztBQUFBLFVBQTlCQyxLQUE4Qjs7QUFDaEQsUUFBSUEsTUFBTUMsTUFBTixHQUFlLENBQW5CLEVBQXNCO0FBQ3BCLFlBQU1DLFVBQVcsSUFBR0gsTUFBTyw0QkFBM0I7O0FBRG9CLDRCQUVLQyxLQUZMOztBQUFBLFlBRWJHLEtBRmE7QUFBQSxZQUVIQyxJQUZHOztBQUdwQixZQUFNQyxhQUFhUixRQUFRUyxhQUFSLEVBQW5CO0FBQ0EsWUFBTUMsTUFBTUMsT0FBT0wsS0FBUCxFQUFjQyxJQUFkLEVBQW9CQyxVQUFwQixDQUFaOztBQUVBUixjQUFRWSxNQUFSLENBQWU7QUFDYkMsY0FBTVAsTUFBTVEsTUFEQztBQUViVCxlQUZhO0FBR2JLLFdBSGEsQ0FHUjtBQUhRLE9BQWY7O0FBTUEsV0FBSyxNQUFNRyxJQUFYLElBQW1CTixJQUFuQixFQUF5QjtBQUN2QlAsZ0JBQVFZ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dGVudCI6WyJpbXBvcnQgcmVzb2x2ZSBmcm9tICdlc2xpbnQtbW9kdWxlLXV0aWxzL3Jlc29sdmUnXG5pbXBvcnQgZG9jc1VybCBmcm9tICcuLi9kb2NzVXJsJ1xuXG5mdW5jdGlvbiBjaGVja0ltcG9ydHMoaW1wb3J0ZWQsIGNvbnRleHQpIHtcbiAgZm9yIChjb25zdCBbbW9kdWxlLCBub2Rlc10gb2YgaW1wb3J0ZWQuZW50cmllcygpKSB7XG4gICAgaWYgKG5vZGVzLmxlbmd0aCA+IDEpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBgJyR7bW9kdWxlfScgaW1wb3J0ZWQgbXVsdGlwbGUgdGltZXMuYFxuICAgICAgY29uc3QgW2ZpcnN0LCAuLi5yZXN0XSA9IG5vZGVzXG4gICAgICBjb25zdCBzb3VyY2VDb2RlID0gY29udGV4dC5nZXRTb3VyY2VDb2RlKClcbiAgICAgIGNvbnN0IGZpeCA9IGdldEZpeChmaXJzdCwgcmVzdCwgc291cmNlQ29kZSlcblxuICAgICAgY29udGV4dC5yZXBvcnQoe1xuICAgICAgICBub2RlOiBmaXJzdC5zb3VyY2UsXG4gICAgICAgIG1lc3NhZ2UsXG4gICAgICAgIGZpeCwgLy8gQXR0YWNoIHRoZSBhdXRvZml4IChpZiBhbnkpIHRvIHRoZSBmaXJzdCBpbXBvcnQuXG4gICAgICB9KVxuXG4gICAgICBmb3IgKGNvbnN0IG5vZGUgb2YgcmVzdCkge1xuICAgICAgICBjb250ZXh0LnJlcG9ydCh7XG4gICAgICAgICAgbm9kZTogbm9kZS5zb3VyY2UsXG4gICAgICAgICAgbWVzc2FnZSxcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0Rml4KGZpcnN0LCByZXN0LCBzb3VyY2VDb2RlKSB7XG4gIC8vIFNvcnJ5IEVTTGludCA8PSAzIHVzZXJzLCBubyBhdXRvZml4IGZvciB5b3UuIEF1dG9maXhpbmcgZHVwbGljYXRlIGltcG9ydHNcbiAgLy8gcmVxdWlyZXMgbXVsdGlwbGUgYGZpeGVyLndoYXRldmVyKClgIGNhbGxzIGluIHRoZSBgZml4YDogV2UgYm90aCBuZWVkIHRvXG4gIC8vIHVwZGF0ZSB0aGUgZmlyc3Qgb25lLCBhbmQgcmVtb3ZlIHRoZSByZXN0LiBTdXBwb3J0IGZvciBtdWx0aXBsZVxuICAvLyBgZml4ZXIud2hhdGV2ZXIoKWAgaW4gYSBzaW5nbGUgYGZpeGAgd2FzIGFkZGVkIGluIEVTTGludCA0LjEuXG4gIC8vIGBzb3VyY2VDb2RlLmdldENvbW1lbnRzQmVmb3JlYCB3YXMgYWRkZWQgaW4gNC4wLCBzbyB0aGF0J3MgYW4gZWFzeSB0aGluZyB0b1xuICAvLyBjaGVjayBmb3IuXG4gIGlmICh0eXBlb2Ygc291cmNlQ29kZS5nZXRDb21tZW50c0JlZm9yZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiB1bmRlZmluZWRcbiAgfVxuXG4gIC8vIEFkanVzdGluZyB0aGUgZmlyc3QgaW1wb3J0IG1pZ2h0IG1ha2UgaXQgbXVsdGlsaW5lLCB3aGljaCBjb3VsZCBicmVha1xuICAvLyBgZXNsaW50LWRpc2FibGUtbmV4dC1saW5lYCBjb21tZW50cyBhbmQgc2ltaWxhciwgc28gYmFpbCBpZiB0aGUgZmlyc3RcbiAgLy8gaW1wb3J0IGhhcyBjb21tZW50cy4gQWxzbywgaWYgdGhlIGZpcnN0IGltcG9ydCBpcyBgaW1wb3J0ICogYXMgbnMgZnJvbVxuICAvLyAnLi9mb28nYCB0aGVyZSdzIG5vdGhpbmcgd2UgY2FuIGRvLlxuICBpZiAoaGFzUHJvYmxlbWF0aWNDb21tZW50cyhmaXJzdCwgc291cmNlQ29kZSkgfHwgaGFzTmFtZXNwYWNlKGZpcnN0KSkge1xuICAgIHJldHVybiB1bmRlZmluZWRcbiAgfVxuXG4gIGNvbnN0IGRlZmF1bHRJbXBvcnROYW1lcyA9IG5ldyBTZXQoXG4gICAgW2ZpcnN0LCAuLi5yZXN0XS5tYXAoZ2V0RGVmYXVsdEltcG9ydE5hbWUpLmZpbHRlcihCb29sZWFuKVxuICApXG5cbiAgLy8gQmFpbCBpZiB0aGVyZSBhcmUgbXVsdGlwbGUgZGlmZmVyZW50IGRlZmF1bHQgaW1wb3J0IG5hbWVzIOKAkyBpdCdzIHVwIHRvIHRoZVxuICAvLyB1c2VyIHRvIGNob29zZSB3aGljaCBvbmUgdG8ga2VlcC5cbiAgaWYgKGRlZmF1bHRJbXBvcnROYW1lcy5zaXplID4gMSkge1xuICAgIHJldHVybiB1bmRlZmluZWRcbiAgfVxuXG4gIC8vIExlYXZlIGl0IHRvIHRoZSB1c2VyIHRvIGhhbmRsZSBjb21tZW50cy4gQWxzbyBza2lwIGBpbXBvcnQgKiBhcyBucyBmcm9tXG4gIC8vICcuL2ZvbydgIGltcG9ydHMsIHNpbmNlIHRoZXkgY2Fubm90IGJlIG1lcmdlZCBpbnRvIGFub3RoZXIgaW1wb3J0LlxuICBjb25zdCByZXN0V2l0aG91dENvbW1lbnRzID0gcmVzdC5maWx0ZXIobm9kZSA9PiAhKFxuICAgIGhhc1Byb2JsZW1hdGljQ29tbWVudHMobm9kZSwgc291cmNlQ29kZSkgfHxcbiAgICBoYXNOYW1lc3BhY2Uobm9kZSlcbiAgKSlcblxuICBjb25zdCBzcGVjaWZpZXJzID0gcmVzdFdpdGhvdXRDb21tZW50c1xuICAgIC5tYXAobm9kZSA9PiB7XG4gICAgICBjb25zdCB0b2tlbnMgPSBzb3VyY2VDb2RlLmdldFRva2Vucyhub2RlKVxuICAgICAgY29uc3Qgb3BlbkJyYWNlID0gdG9rZW5zLmZpbmQodG9rZW4gPT4gaXNQdW5jdHVhdG9yKHRva2VuLCAneycpKVxuICAgICAgY29uc3QgY2xvc2VCcmFjZSA9IHRva2Vucy5maW5kKHRva2VuID0+IGlzUHVuY3R1YXRvcih0b2tlbiwgJ30nKSlcblxuICAgICAgaWYgKG9wZW5CcmFjZSA9PSBudWxsIHx8IGNsb3NlQnJhY2UgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGltcG9ydE5vZGU6IG5vZGUsXG4gICAgICAgIHRleHQ6IHNvdXJjZUNvZGUudGV4dC5zbGljZShvcGVuQnJhY2UucmFuZ2VbMV0sIGNsb3NlQnJhY2UucmFuZ2VbMF0pLFxuICAgICAgICBoYXNUcmFpbGluZ0NvbW1hOiBpc1B1bmN0dWF0b3Ioc291cmNlQ29kZS5nZXRUb2tlbkJlZm9yZShjbG9zZUJyYWNlKSwgJywnKSxcbiAgICAgICAgaXNFbXB0eTogIWhhc1NwZWNpZmllcnMobm9kZSksXG4gICAgICB9XG4gICAgfSlcbiAgICAuZmlsdGVyKEJvb2xlYW4pXG5cbiAgY29uc3QgdW5uZWNlc3NhcnlJbXBvcnRzID0gcmVzdFdpdGhvdXRDb21tZW50cy5maWx0ZXIobm9kZSA9PlxuICAgICFoYXNTcGVjaWZpZXJzKG5vZGUpICYmXG4gICAgIWhhc05hbWVzcGFjZShub2RlKSAmJlxuICAgICFzcGVjaWZpZXJzLnNvbWUoc3BlY2lmaWVyID0+IHNwZWNpZmllci5pbXBvcnROb2RlID09PSBub2RlKVxuICApXG5cbiAgY29uc3Qgc2hvdWxkQWRkRGVmYXVsdCA9IGdldERlZmF1bHRJbXBvcnROYW1lKGZpcnN0KSA9PSBudWxsICYmIGRlZmF1bHRJbXBvcnROYW1lcy5zaXplID09PSAxXG4gIGNvbnN0IHNob3VsZEFkZFNwZWNpZmllcnMgPSBzcGVjaWZpZXJzLmxlbmd0aCA+IDBcbiAgY29uc3Qgc2hvdWxkUmVtb3ZlVW5uZWNlc3NhcnkgPSB1bm5lY2Vzc2FyeUltcG9ydHMubGVuZ3RoID4gMFxuXG4gIGlmICghKHNob3VsZEFkZERlZmF1bHQgfHwgc2hvdWxkQWRkU3BlY2lmaWVycyB8fCBzaG91bGRSZW1vdmVVbm5lY2Vzc2FyeSkpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH1cblxuICByZXR1cm4gZml4ZXIgPT4ge1xuICAgIGNvbnN0IHRva2VucyA9IHNvdXJjZUNvZGUuZ2V0VG9rZW5zKGZpcnN0KVxuICAgIGNvbnN0IG9wZW5CcmFjZSA9IHRva2Vucy5maW5kKHRva2VuID0+IGlzUHVuY3R1YXRvcih0b2tlbiwgJ3snKSlcbiAgICBjb25zdCBjbG9zZUJyYWNlID0gdG9rZW5zLmZpbmQodG9rZW4gPT4gaXNQdW5jdHVhdG9yKHRva2VuLCAnfScpKVxuICAgIGNvbnN0IGZpcnN0VG9rZW4gPSBzb3VyY2VDb2RlLmdldEZpcnN0VG9rZW4oZmlyc3QpXG4gICAgY29uc3QgW2RlZmF1bHRJbXBvcnROYW1lXSA9IGRlZmF1bHRJbXBvcnROYW1lc1xuXG4gICAgY29uc3QgZmlyc3RIYXNUcmFpbGluZ0NvbW1hID1cbiAgICAgIGNsb3NlQnJhY2UgIT0gbnVsbCAmJlxuICAgICAgaXNQdW5jdHVhdG9yKHNvdXJjZUNvZGUuZ2V0VG9rZW5CZWZvcmUoY2xvc2VCcmFjZSksICcsJylcbiAgICBjb25zdCBmaXJzdElzRW1wdHkgPSAhaGFzU3BlY2lmaWVycyhmaXJzdClcblxuICAgIGNvbnN0IFtzcGVjaWZpZXJzVGV4dF0gPSBzcGVjaWZpZXJzLnJlZHVjZShcbiAgICAgIChbcmVzdWx0LCBuZWVkc0NvbW1hXSwgc3BlY2lmaWVyKSA9PiB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgbmVlZHNDb21tYSAmJiAhc3BlY2lmaWVyLmlzRW1wdHlcbiAgICAgICAgICAgID8gYCR7cmVzdWx0fSwke3NwZWNpZmllci50ZXh0fWBcbiAgICAgICAgICAgIDogYCR7cmVzdWx0fSR7c3BlY2lmaWVyLnRleHR9YCxcbiAgICAgICAgICBzcGVjaWZpZXIuaXNFbXB0eSA/IG5lZWRzQ29tbWEgOiB0cnVlLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgICAgWycnLCAhZmlyc3RIYXNUcmFpbGluZ0NvbW1hICYmICFmaXJzdElzRW1wdHldXG4gICAgKVxuXG4gICAgY29uc3QgZml4ZXMgPSBbXVxuXG4gICAgaWYgKHNob3VsZEFkZERlZmF1bHQgJiYgb3BlbkJyYWNlID09IG51bGwgJiYgc2hvdWxkQWRkU3BlY2lmaWVycykge1xuICAgICAgLy8gYGltcG9ydCAnLi9mb28nYCDihpIgYGltcG9ydCBkZWYsIHsuLi59IGZyb20gJy4vZm9vJ2BcbiAgICAgIGZpeGVzLnB1c2goXG4gICAgICAgIGZpeGVyLmluc2VydFRleHRBZnRlcihmaXJzdFRva2VuLCBgICR7ZGVmYXVsdEltcG9ydE5hbWV9LCB7JHtzcGVjaWZpZXJzVGV4dH19IGZyb21gKVxuICAgICAgKVxuICAgIH0gZWxzZSBpZiAoc2hvdWxkQWRkRGVmYXVsdCAmJiBvcGVuQnJhY2UgPT0gbnVsbCAmJiAhc2hvdWxkQWRkU3BlY2lmaWVycykge1xuICAgICAgLy8gYGltcG9ydCAnLi9mb28nYCDihpIgYGltcG9ydCBkZWYgZnJvbSAnLi9mb28nYFxuICAgICAgZml4ZXMucHVzaChmaXhlci5pbnNlcnRUZXh0QWZ0ZXIoZmlyc3RUb2tlbiwgYCAke2RlZmF1bHRJbXBvcnROYW1lfSBmcm9tYCkpXG4gICAgfSBlbHNlIGlmIChzaG91bGRBZGREZWZhdWx0ICYmIG9wZW5CcmFjZSAhPSBudWxsICYmIGNsb3NlQnJhY2UgIT0gbnVsbCkge1xuICAgICAgLy8gYGltcG9ydCB7Li4ufSBmcm9tICcuL2ZvbydgIOKGkiBgaW1wb3J0IGRlZiwgey4uLn0gZnJvbSAnLi9mb28nYFxuICAgICAgZml4ZXMucHVzaChmaXhlci5pbnNlcnRUZXh0QWZ0ZXIoZmlyc3RUb2tlbiwgYCAke2RlZmF1bHRJbXBvcnROYW1lfSxgKSlcbiAgICAgIGlmIChzaG91bGRBZGRTcGVjaWZpZXJzKSB7XG4gICAgICAgIC8vIGBpbXBvcnQgZGVmLCB7Li4ufSBmcm9tICcuL2ZvbydgIOKGkiBgaW1wb3J0IGRlZiwgey4uLiwgLi4ufSBmcm9tICcuL2ZvbydgXG4gICAgICAgIGZpeGVzLnB1c2goZml4ZXIuaW5zZXJ0VGV4dEJlZm9yZShjbG9zZUJyYWNlLCBzcGVjaWZpZXJzVGV4dCkpXG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghc2hvdWxkQWRkRGVmYXVsdCAmJiBvcGVuQnJhY2UgPT0gbnVsbCAmJiBzaG91bGRBZGRTcGVjaWZpZXJzKSB7XG4gICAgICAvLyBgaW1wb3J0ICcuL2ZvbydgIOKGkiBgaW1wb3J0IHsuLi59IGZyb20gJy4vZm9vJ2BcbiAgICAgIGZpeGVzLnB1c2goZml4ZXIuaW5zZXJ0VGV4dEFmdGVyKGZpcnN0VG9rZW4sIGAgeyR7c3BlY2lmaWVyc1RleHR9fSBmcm9tYCkpXG4gICAgfSBlbHNlIGlmICghc2hvdWxkQWRkRGVmYXVsdCAmJiBvcGVuQnJhY2UgIT0gbnVsbCAmJiBjbG9zZUJyYWNlICE9IG51bGwpIHtcbiAgICAgIC8vIGBpbXBvcnQgey4uLn0gJy4vZm9vJ2Ag4oaSIGBpbXBvcnQgey4uLiwgLi4ufSBmcm9tICcuL2ZvbydgXG4gICAgICBmaXhlcy5wdXNoKGZpeGVyLmluc2VydFRleHRCZWZvcmUoY2xvc2VCcmFjZSwgc3BlY2lmaWVyc1RleHQpKVxuICAgIH1cblxuICAgIC8vIFJlbW92ZSBpbXBvcnRzIHdob3NlIHNwZWNpZmllcnMgaGF2ZSBiZWVuIG1vdmVkIGludG8gdGhlIGZpcnN0IGltcG9ydC5cbiAgICBmb3IgKGNvbnN0IHNwZWNpZmllciBvZiBzcGVjaWZpZXJzKSB7XG4gICAgICBmaXhlcy5wdXNoKGZpeGVyLnJlbW92ZShzcGVjaWZpZXIuaW1wb3J0Tm9kZSkpXG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIGltcG9ydHMgd2hvc2UgZGVmYXVsdCBpbXBvcnQgaGFzIGJlZW4gbW92ZWQgdG8gdGhlIGZpcnN0IGltcG9ydCxcbiAgICAvLyBhbmQgc2lkZS1lZmZlY3Qtb25seSBpbXBvcnRzIHRoYXQgYXJlIHVubmVjZXNzYXJ5IGR1ZSB0byB0aGUgZmlyc3RcbiAgICAvLyBpbXBvcnQuXG4gICAgZm9yIChjb25zdCBub2RlIG9mIHVubmVjZXNzYXJ5SW1wb3J0cykge1xuICAgICAgZml4ZXMucHVzaChmaXhlci5yZW1vdmUobm9kZSkpXG4gICAgfVxuXG4gICAgcmV0dXJuIGZpeGVzXG4gIH1cbn1cblxuZnVuY3Rpb24gaXNQdW5jdHVhdG9yKG5vZGUsIHZhbHVlKSB7XG4gIHJldHVybiBub2RlLnR5cGUgPT09ICdQdW5jdHVhdG9yJyAmJiBub2RlLnZhbHVlID09PSB2YWx1ZVxufVxuXG4vLyBHZXQgdGhlIG5hbWUgb2YgdGhlIGRlZmF1bHQgaW1wb3J0IG9mIGBub2RlYCwgaWYgYW55LlxuZnVuY3Rpb24gZ2V0RGVmYXVsdEltcG9ydE5hbWUobm9kZSkge1xuICBjb25zdCBkZWZhdWx0U3BlY2lmaWVyID0gbm9kZS5zcGVjaWZpZXJzXG4gICAgLmZpbmQoc3BlY2lmaWVyID0+IHNwZWNpZmllci50eXBlID09PSAnSW1wb3J0RGVmYXVsdFNwZWNpZmllcicpXG4gIHJldHVybiBkZWZhdWx0U3BlY2lmaWVyICE9IG51bGwgPyBkZWZhdWx0U3BlY2lmaWVyLmxvY2FsLm5hbWUgOiB1bmRlZmluZWRcbn1cblxuLy8gQ2hlY2tzIHdoZXRoZXIgYG5vZGVgIGhhcyBhIG5hbWVzcGFjZSBpbXBvcnQuXG5mdW5jdGlvbiBoYXNOYW1lc3BhY2Uobm9kZSkge1xuICBjb25zdCBzcGVjaWZpZXJzID0gbm9kZS5zcGVjaWZpZXJzXG4gICAgLmZpbHRlcihzcGVjaWZpZXIgPT4gc3BlY2lmaWVyLnR5cGUgPT09ICdJbXBvcnROYW1lc3BhY2VTcGVjaWZpZXInKVxuICByZXR1cm4gc3BlY2lmaWVycy5sZW5ndGggPiAwXG59XG5cbi8vIENoZWNrcyB3aGV0aGVyIGBub2RlYCBoYXMgYW55IG5vbi1kZWZhdWx0IHNwZWNpZmllcnMuXG5mdW5jdGlvbiBoYXNTcGVjaWZpZXJzKG5vZGUpIHtcbiAgY29uc3Qgc3BlY2lmaWVycyA9IG5vZGUuc3BlY2lmaWVyc1xuICAgIC5maWx0ZXIoc3BlY2lmaWVyID0+IHNwZWNpZmllci50eXBlID09PSAnSW1wb3J0U3BlY2lmaWVyJylcbiAgcmV0dXJuIHNwZWNpZmllcnMubGVuZ3RoID4gMFxufVxuXG4vLyBJdCdzIG5vdCBvYnZpb3VzIHdoYXQgdGhlIHVzZXIgd2FudHMgdG8gZG8gd2l0aCBjb21tZW50cyBhc3NvY2lhdGVkIHdpdGhcbi8vIGR1cGxpY2F0ZSBpbXBvcnRzLCBzbyBza2lwIGltcG9ydHMgd2l0aCBjb21tZW50cyB3aGVuIGF1dG9maXhpbmcuXG5mdW5jdGlvbiBoYXNQcm9ibGVtYXRpY0NvbW1lbnRzKG5vZGUsIHNvdXJjZUNvZGUpIHtcbiAgcmV0dXJuIChcbiAgICBoYXNDb21tZW50QmVmb3JlKG5vZGUsIHNvdXJjZUNvZGUpIHx8XG4gICAgaGFzQ29tbWVudEFmdGVyKG5vZGUsIHNvdXJjZUNvZGUpIHx8XG4gICAgaGFzQ29tbWVudEluc2lkZU5vblNwZWNpZmllcnMobm9kZSwgc291cmNlQ29kZSlcbiAgKVxufVxuXG4vLyBDaGVja3Mgd2hldGhlciBgbm9kZWAgaGFzIGEgY29tbWVudCAodGhhdCBlbmRzKSBvbiB0aGUgcHJldmlvdXMgbGluZSBvciBvblxuLy8gdGhlIHNhbWUgbGluZSBhcyBgbm9kZWAgKHN0YXJ0cykuXG5mdW5jdGlvbiBoYXNDb21tZW50QmVmb3JlKG5vZGUsIHNvdXJjZUNvZGUpIHtcbiAgcmV0dXJuIHNvdXJjZUNvZGUuZ2V0Q29tbWVudHNCZWZvcmUobm9kZSlcbiAgICAuc29tZShjb21tZW50ID0+IGNvbW1lbnQubG9jLmVuZC5saW5lID49IG5vZGUubG9jLnN0YXJ0LmxpbmUgLSAxKVxufVxuXG4vLyBDaGVja3Mgd2hldGhlciBgbm9kZWAgaGFzIGEgY29tbWVudCAodGhhdCBzdGFydHMpIG9uIHRoZSBzYW1lIGxpbmUgYXMgYG5vZGVgXG4vLyAoZW5kcykuXG5mdW5jdGlvbiBoYXNDb21tZW50QWZ0ZXIobm9kZSwgc291cmNlQ29kZSkge1xuICByZXR1cm4gc291cmNlQ29kZS5nZXRDb21tZW50c0FmdGVyKG5vZGUpXG4gICAgLnNvbWUoY29tbWVudCA9PiBjb21tZW50LmxvYy5zdGFydC5saW5lID09PSBub2RlLmxvYy5lbmQubGluZSlcbn1cblxuLy8gQ2hlY2tzIHdoZXRoZXIgYG5vZGVgIGhhcyBhbnkgY29tbWVudHMgX2luc2lkZSxfIGV4Y2VwdCBpbnNpZGUgdGhlIGB7Li4ufWBcbi8vIHBhcnQgKGlmIGFueSkuXG5mdW5jdGlvbiBoYXNDb21tZW50SW5zaWRlTm9uU3BlY2lmaWVycyhub2RlLCBzb3VyY2VDb2RlKSB7XG4gIGNvbnN0IHRva2VucyA9IHNvdXJjZUNvZGUuZ2V0VG9rZW5zKG5vZGUpXG4gIGNvbnN0IG9wZW5CcmFjZUluZGV4ID0gdG9rZW5zLmZpbmRJbmRleCh0b2tlbiA9PiBpc1B1bmN0dWF0b3IodG9rZW4sICd7JykpXG4gIGNvbnN0IGNsb3NlQnJhY2VJbmRleCA9IHRva2Vucy5maW5kSW5kZXgodG9rZW4gPT4gaXNQdW5jdHVhdG9yKHRva2VuLCAnfScpKVxuICAvLyBTbGljZSBhd2F5IHRoZSBmaXJzdCB0b2tlbiwgc2luY2Ugd2UncmUgbm8gbG9va2luZyBmb3IgY29tbWVudHMgX2JlZm9yZV9cbiAgLy8gYG5vZGVgIChvbmx5IGluc2lkZSkuIElmIHRoZXJlJ3MgYSBgey4uLn1gIHBhcnQsIGxvb2sgZm9yIGNvbW1lbnRzIGJlZm9yZVxuICAvLyB0aGUgYHtgLCBidXQgbm90IGJlZm9yZSB0aGUgYH1gIChoZW5jZSB0aGUgYCsxYHMpLlxuICBjb25zdCBzb21lVG9rZW5zID0gb3BlbkJyYWNlSW5kZXggPj0gMCAmJiBjbG9zZUJyYWNlSW5kZXggPj0gMFxuICAgID8gdG9rZW5zLnNsaWNlKDEsIG9wZW5CcmFjZUluZGV4ICsgMSkuY29uY2F0KHRva2Vucy5zbGljZShjbG9zZUJyYWNlSW5kZXggKyAxKSlcbiAgICA6IHRva2Vucy5zbGljZSgxKVxuICByZXR1cm4gc29tZVRva2Vucy5zb21lKHRva2VuID0+IHNvdXJjZUNvZGUuZ2V0Q29tbWVudHNCZWZvcmUodG9rZW4pLmxlbmd0aCA+IDApXG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBtZXRhOiB7XG4gICAgdHlwZTogJ3Byb2JsZW0nLFxuICAgIGRvY3M6IHtcbiAgICAgIHVybDogZG9jc1VybCgnbm8tZHVwbGljYXRlcycpLFxuICAgIH0sXG4gICAgZml4YWJsZTogJ2NvZGUnLFxuICB9LFxuXG4gIGNyZWF0ZTogZnVuY3Rpb24gKGNvbnRleHQpIHtcbiAgICBjb25zdCBpbXBvcnRlZCA9IG5ldyBNYXAoKVxuICAgIGNvbnN0IHR5cGVzSW1wb3J0ZWQgPSBuZXcgTWFwKClcbiAgICByZXR1cm4ge1xuICAgICAgJ0ltcG9ydERlY2xhcmF0aW9uJzogZnVuY3Rpb24gKG4pIHtcbiAgICAgICAgLy8gcmVzb2x2ZWQgcGF0aCB3aWxsIGNvdmVyIGFsaWFzZWQgZHVwbGljYXRlc1xuICAgICAgICBjb25zdCByZXNvbHZlZFBhdGggPSByZXNvbHZlKG4uc291cmNlLnZhbHVlLCBjb250ZXh0KSB8fCBuLnNvdXJjZS52YWx1ZVxuICAgICAgICBjb25zdCBpbXBvcnRNYXAgPSBuLmltcG9ydEtpbmQgPT09ICd0eXBlJyA/IHR5cGVzSW1wb3J0ZWQgOiBpbXBvcnRlZFxuXG4gICAgICAgIGlmIChpbXBvcnRNYXAuaGFzKHJlc29sdmVkUGF0aCkpIHtcbiAgICAgICAgICBpbXBvcnRNYXAuZ2V0KHJlc29sdmVkUGF0aCkucHVzaChuKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGltcG9ydE1hcC5zZXQocmVzb2x2ZWRQYXRoLCBbbl0pXG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgICdQcm9ncmFtOmV4aXQnOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNoZWNrSW1wb3J0cyhpbXBvcnRlZCwgY29udGV4dClcbiAgICAgICAgY2hlY2tJbXBvcnRzKHR5cGVzSW1wb3J0ZWQsIGNvbnRleHQpXG4gICAgICB9LFxuICAgIH1cbiAgfSxcbn1cbiJdfQ==