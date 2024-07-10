"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function xDnsPrefetchControl(options) {
    if (options === void 0) { options = {}; }
    var headerValue = options.allow ? "on" : "off";
    return function xDnsPrefetchControlMiddleware(_req, res, next) {
        res.setHeader("X-DNS-Prefetch-Control", headerValue);
        next();
    };
}
module.exports = xDnsPrefetchControl;
exports.default = xDnsPrefetchControl;
