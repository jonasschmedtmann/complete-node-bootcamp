"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var is_function_1 = __importDefault(require("../../is-function"));
var is_string_1 = __importDefault(require("../../is-string"));
module.exports = function (key, value) {
    if (value === false) {
        return;
    }
    if (is_function_1.default(value)) {
        return;
    }
    if (!is_string_1.default(value) || value.length === 0) {
        throw new Error("\"" + value + "\" is not a valid value for " + key + ". Use a non-empty string.");
    }
};
