"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function parseActionOption(actionOption) {
    var invalidActionErr = new Error('action must be undefined, "DENY", "ALLOW-FROM", or "SAMEORIGIN".');
    if (actionOption === undefined) {
        actionOption = "SAMEORIGIN";
    }
    else if (actionOption instanceof String) {
        actionOption = actionOption.valueOf();
    }
    var result;
    if (typeof actionOption === "string") {
        result = actionOption.toUpperCase();
    }
    else {
        throw invalidActionErr;
    }
    if (result === "ALLOWFROM") {
        result = "ALLOW-FROM";
    }
    else if (result === "SAME-ORIGIN") {
        result = "SAMEORIGIN";
    }
    if (["DENY", "ALLOW-FROM", "SAMEORIGIN"].indexOf(result) === -1) {
        throw invalidActionErr;
    }
    return result;
}
function parseDomainOption(domainOption) {
    if (domainOption instanceof String) {
        domainOption = domainOption.valueOf();
    }
    if (typeof domainOption !== "string") {
        throw new Error("ALLOW-FROM action requires a string domain parameter.");
    }
    else if (!domainOption.length) {
        throw new Error("domain parameter must not be empty.");
    }
    return domainOption;
}
function getHeaderValueFromOptions(options) {
    var action = parseActionOption(options.action);
    if (action === "ALLOW-FROM") {
        var domain = parseDomainOption(options.domain);
        return action + " " + domain;
    }
    else {
        return action;
    }
}
function xFrameOptions(options) {
    if (options === void 0) { options = {}; }
    var headerValue = getHeaderValueFromOptions(options);
    return function xFrameOptionsMiddleware(_req, res, next) {
        res.setHeader("X-Frame-Options", headerValue);
        next();
    };
}
module.exports = xFrameOptions;
exports.default = xFrameOptions;
