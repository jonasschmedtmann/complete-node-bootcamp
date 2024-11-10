"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var is_boolean_1 = __importDefault(require("../../is-boolean"));
module.exports = function (key, value) {
    if (!is_boolean_1.default(value)) {
        throw new Error("\"" + value + "\" is not a valid value for " + key + ". Use `true` or `false`.");
    }
};
