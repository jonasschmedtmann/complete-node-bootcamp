"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var dasherize_1 = __importDefault(require("dasherize"));
var check_directive_1 = __importDefault(require("./check-directive"));
function isObject(value) {
    return Object.prototype.toString.call(value) === '[object Object]';
}
module.exports = function (options) {
    if (!isObject(options)) {
        throw new Error('csp must be called with an object argument. See the documentation.');
    }
    var directives = options.directives;
    if (!isObject(directives) || Object.keys(directives).length === 0) {
        throw new Error('csp must have at least one directive under the "directives" key. See the documentation.');
    }
    Object.keys(directives).forEach(function (directiveKey) {
        var typedKey = directiveKey;
        check_directive_1.default(dasherize_1.default(directiveKey), directives[typedKey], options);
    });
};
