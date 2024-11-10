"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var camelize_1 = __importDefault(require("camelize"));
var content_security_policy_builder_1 = __importDefault(require("content-security-policy-builder"));
var bowser_1 = __importDefault(require("bowser"));
var is_function_1 = __importDefault(require("./lib/is-function"));
var check_options_1 = __importDefault(require("./lib/check-options"));
var contains_function_1 = __importDefault(require("./lib/contains-function"));
var get_header_keys_for_browser_1 = __importDefault(require("./lib/get-header-keys-for-browser"));
var transform_directives_for_browser_1 = __importDefault(require("./lib/transform-directives-for-browser"));
var parse_dynamic_directives_1 = __importDefault(require("./lib/parse-dynamic-directives"));
var config_1 = __importDefault(require("./lib/config"));
module.exports = function csp(options) {
    check_options_1.default(options);
    var originalDirectives = camelize_1.default(options.directives || {});
    var directivesAreDynamic = contains_function_1.default(originalDirectives);
    var shouldBrowserSniff = options.browserSniff !== false;
    if (shouldBrowserSniff) {
        return function csp(req, res, next) {
            var userAgent = req.headers['user-agent'];
            var browser;
            if (userAgent) {
                browser = bowser_1.default.getParser(userAgent);
            }
            else {
                browser = undefined;
            }
            var headerKeys;
            if (options.setAllHeaders || !userAgent) {
                headerKeys = config_1.default.allHeaders;
            }
            else {
                headerKeys = get_header_keys_for_browser_1.default(browser, options);
            }
            if (headerKeys.length === 0) {
                next();
                return;
            }
            var directives = transform_directives_for_browser_1.default(browser, originalDirectives);
            if (directivesAreDynamic) {
                directives = parse_dynamic_directives_1.default(directives, [req, res]);
            }
            var policyString = content_security_policy_builder_1.default({ directives: directives });
            headerKeys.forEach(function (headerKey) {
                if (is_function_1.default(options.reportOnly) && options.reportOnly(req, res) ||
                    !is_function_1.default(options.reportOnly) && options.reportOnly) {
                    headerKey += '-Report-Only';
                }
                res.setHeader(headerKey, policyString);
            });
            next();
        };
    }
    else {
        var headerKeys_1 = options.setAllHeaders ? config_1.default.allHeaders : ['Content-Security-Policy'];
        return function csp(req, res, next) {
            var directives = parse_dynamic_directives_1.default(originalDirectives, [req, res]);
            var policyString = content_security_policy_builder_1.default({ directives: directives });
            if (is_function_1.default(options.reportOnly) && options.reportOnly(req, res) ||
                !is_function_1.default(options.reportOnly) && options.reportOnly) {
                headerKeys_1.forEach(function (headerKey) {
                    res.setHeader(headerKey + "-Report-Only", policyString);
                });
            }
            else {
                headerKeys_1.forEach(function (headerKey) {
                    res.setHeader(headerKey, policyString);
                });
            }
            next();
        };
    }
};
