"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var is_function_1 = __importDefault(require("./is-function"));
var is_string_1 = __importDefault(require("./is-string"));
module.exports = function parseDynamicDirectives(directives, functionArgs) {
    var result = {};
    Object.keys(directives).forEach(function (key) {
        var typedKey = key;
        var value = directives[typedKey];
        if (Array.isArray(value)) {
            result[typedKey] = value.map(function (element) {
                if (is_function_1.default(element)) {
                    return element.apply(void 0, functionArgs);
                }
                else {
                    return element;
                }
            });
        }
        else if (is_function_1.default(value)) {
            result[typedKey] = value.apply(void 0, functionArgs);
        }
        else if (value === true || is_string_1.default(value)) {
            result[typedKey] = value;
        }
    });
    return result;
};
