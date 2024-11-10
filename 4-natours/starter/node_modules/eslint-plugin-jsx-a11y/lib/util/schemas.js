"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateObjSchema = exports.enumArraySchema = exports.arraySchema = void 0;
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
/**
 * JSON schema to accept an array of unique strings
 */
var arraySchema = exports.arraySchema = {
  type: 'array',
  items: {
    type: 'string'
  },
  uniqueItems: true,
  additionalItems: false
};

/**
 * JSON schema to accept an array of unique strings from an enumerated list.
 */
var enumArraySchema = exports.enumArraySchema = function enumArraySchema() {
  var enumeratedList = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var minItems = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  return _objectSpread(_objectSpread({}, arraySchema), {}, {
    items: {
      type: 'string',
      "enum": enumeratedList
    },
    minItems
  });
};

/**
 * Factory function to generate an object schema
 * with specified properties object
 */
var generateObjSchema = exports.generateObjSchema = function generateObjSchema() {
  var properties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var required = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
  return {
    type: 'object',
    properties,
    required
  };
};