"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function xDownloadOptionsMiddleware(_req, res, next) {
    res.setHeader("X-Download-Options", "noopen");
    next();
}
function xDownloadOptions() {
    return xDownloadOptionsMiddleware;
}
module.exports = xDownloadOptions;
exports.default = xDownloadOptions;
