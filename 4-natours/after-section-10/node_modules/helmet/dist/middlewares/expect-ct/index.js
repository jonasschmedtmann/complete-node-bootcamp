"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function parseMaxAge(value) {
    if (value === undefined) {
        return 0;
    }
    else if (typeof value === "number" && value >= 0) {
        return Math.floor(value);
    }
    else {
        throw new Error(value + " is not a valid value for maxAge. Please choose a positive integer.");
    }
}
function getHeaderValueFromOptions(options) {
    var directives = [];
    if (options.enforce) {
        directives.push("enforce");
    }
    directives.push("max-age=" + parseMaxAge(options.maxAge));
    if (options.reportUri) {
        directives.push("report-uri=\"" + options.reportUri + "\"");
    }
    return directives.join(", ");
}
function expectCt(options) {
    if (options === void 0) { options = {}; }
    var headerValue = getHeaderValueFromOptions(options);
    return function expectCtMiddleware(_req, res, next) {
        res.setHeader("Expect-CT", headerValue);
        next();
    };
}
module.exports = expectCt;
exports.default = expectCt;
