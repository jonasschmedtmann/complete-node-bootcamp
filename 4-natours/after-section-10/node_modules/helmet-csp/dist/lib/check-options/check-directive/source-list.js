"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var config_1 = __importDefault(require("../../config"));
var is_function_1 = __importDefault(require("../../is-function"));
module.exports = function sourceListCheck(key, value) {
    if (value === false) {
        return;
    }
    if (!Array.isArray(value)) {
        throw new Error("\"" + value + "\" is not a valid value for " + key + ". Use an array of strings.");
    }
    if (value.length === 0) {
        throw new Error(key + " must have at least one value. To block everything, set " + key + " to [\"'none'\"].");
    }
    value.forEach(function (sourceExpression) {
        if (!sourceExpression) {
            throw new Error("\"" + sourceExpression + "\" is not a valid source expression. Only non-empty strings are allowed.");
        }
        if (is_function_1.default(sourceExpression)) {
            return;
        }
        sourceExpression = sourceExpression.valueOf();
        if (typeof sourceExpression !== 'string' || sourceExpression.length === 0) {
            throw new Error("\"" + sourceExpression + "\" is not a valid source expression. Only non-empty strings are allowed.");
        }
        var directiveInfo = config_1.default.directives[key];
        if (!directiveInfo.hasUnsafes && config_1.default.unsafes.indexOf(sourceExpression) !== -1 ||
            !directiveInfo.hasStrictDynamic && config_1.default.strictDynamics.indexOf(sourceExpression) !== -1) {
            throw new Error("\"" + sourceExpression + "\" does not make sense in " + key + ". Remove it.");
        }
        if (config_1.default.mustQuote.indexOf(sourceExpression) !== -1) {
            throw new Error("\"" + sourceExpression + "\" must be quoted in " + key + ". Change it to \"'" + sourceExpression + "'\" in your source list. Force this by enabling loose mode.");
        }
    });
};
