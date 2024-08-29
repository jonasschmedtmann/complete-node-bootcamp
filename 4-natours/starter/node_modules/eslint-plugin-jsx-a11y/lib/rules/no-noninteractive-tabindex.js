"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _ariaQuery = require("aria-query");
var _jsxAstUtils = require("jsx-ast-utils");
var _arrayIncludes = _interopRequireDefault(require("array-includes"));
var _getElementType = _interopRequireDefault(require("../util/getElementType"));
var _isInteractiveElement = _interopRequireDefault(require("../util/isInteractiveElement"));
var _isInteractiveRole = _interopRequireDefault(require("../util/isInteractiveRole"));
var _isNonLiteralProperty = _interopRequireDefault(require("../util/isNonLiteralProperty"));
var _schemas = require("../util/schemas");
var _getTabIndex = _interopRequireDefault(require("../util/getTabIndex"));
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @fileoverview Disallow tabindex on static and noninteractive elements
                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @author jessebeach
                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                          */ // ----------------------------------------------------------------------------
// Rule Definition
// ----------------------------------------------------------------------------
var errorMessage = '`tabIndex` should only be declared on interactive elements.';
var schema = (0, _schemas.generateObjSchema)({
  roles: _objectSpread(_objectSpread({}, _schemas.arraySchema), {}, {
    description: 'An array of ARIA roles'
  }),
  tags: _objectSpread(_objectSpread({}, _schemas.arraySchema), {}, {
    description: 'An array of HTML tag names'
  })
});
var _default = exports["default"] = {
  meta: {
    docs: {
      url: 'https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/no-noninteractive-tabindex.md',
      description: '`tabIndex` should only be declared on interactive elements.'
    },
    schema: [schema]
  },
  create: function create(context) {
    var options = context.options;
    var elementType = (0, _getElementType["default"])(context);
    return {
      JSXOpeningElement: function (_JSXOpeningElement) {
        function JSXOpeningElement(_x) {
          return _JSXOpeningElement.apply(this, arguments);
        }
        JSXOpeningElement.toString = function () {
          return _JSXOpeningElement.toString();
        };
        return JSXOpeningElement;
      }(function (node) {
        var type = elementType(node);
        var attributes = node.attributes;
        var tabIndexProp = (0, _jsxAstUtils.getProp)(attributes, 'tabIndex');
        var tabIndex = (0, _getTabIndex["default"])(tabIndexProp);
        // Early return;
        if (typeof tabIndex === 'undefined') {
          return;
        }
        var role = (0, _jsxAstUtils.getLiteralPropValue)((0, _jsxAstUtils.getProp)(node.attributes, 'role'));
        if (!_ariaQuery.dom.has(type)) {
          // Do not test higher level JSX components, as we do not know what
          // low-level DOM element this maps to.
          return;
        }
        // Allow for configuration overrides.
        var _ref = options[0] || {},
          tags = _ref.tags,
          roles = _ref.roles,
          allowExpressionValues = _ref.allowExpressionValues;
        if (tags && (0, _arrayIncludes["default"])(tags, type)) {
          return;
        }
        if (roles && (0, _arrayIncludes["default"])(roles, role)) {
          return;
        }
        if (allowExpressionValues === true && (0, _isNonLiteralProperty["default"])(attributes, 'role')) {
          // Special case if role is assigned using ternary with literals on both side
          var roleProp = (0, _jsxAstUtils.getProp)(attributes, 'role');
          if (roleProp && roleProp.type === 'JSXAttribute' && roleProp.value.type === 'JSXExpressionContainer') {
            if (roleProp.value.expression.type === 'ConditionalExpression') {
              if (roleProp.value.expression.consequent.type === 'Literal' && roleProp.value.expression.alternate.type === 'Literal') {
                return;
              }
            }
          }
          return;
        }
        if ((0, _isInteractiveElement["default"])(type, attributes) || (0, _isInteractiveRole["default"])(type, attributes)) {
          return;
        }
        if (tabIndex >= 0) {
          context.report({
            node: tabIndexProp,
            message: errorMessage
          });
        }
      })
    };
  }
};
module.exports = exports.default;