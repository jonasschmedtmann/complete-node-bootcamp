"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var config_1 = __importDefault(require("../../config"));
var boolean_1 = __importDefault(require("./boolean"));
var plugin_types_1 = __importDefault(require("./plugin-types"));
var report_uri_1 = __importDefault(require("./report-uri"));
var require_sri_for_1 = __importDefault(require("./require-sri-for"));
var sandbox_1 = __importDefault(require("./sandbox"));
var source_list_1 = __importDefault(require("./source-list"));
var checkers = {
    boolean: boolean_1.default,
    pluginTypes: plugin_types_1.default,
    reportUri: report_uri_1.default,
    requireSriFor: require_sri_for_1.default,
    sandbox: sandbox_1.default,
    sourceList: source_list_1.default,
};
module.exports = function checkDirective(key, value, options) {
    if (options.loose) {
        return;
    }
    if (!Object.prototype.hasOwnProperty.call(config_1.default.directives, key)) {
        throw new Error("\"" + key + "\" is an invalid directive. See the documentation for the supported list. Force this by enabling loose mode.");
    }
    // This cast is safe thanks to the above check.
    var directiveType = config_1.default.directives[key].type;
    checkers[directiveType](key, value);
};
