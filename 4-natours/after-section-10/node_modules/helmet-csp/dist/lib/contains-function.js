"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var is_function_1 = __importDefault(require("./is-function"));
module.exports = function containsFunction(obj) {
    for (var key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) {
            continue;
        }
        var value = obj[key];
        if (Array.isArray(value) && value.some(is_function_1.default) || is_function_1.default(value)) {
            return true;
        }
    }
    return false;
};
