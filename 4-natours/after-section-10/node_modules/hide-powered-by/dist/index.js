"use strict";
module.exports = function hidePoweredBy(options) {
    var _a = (options || {}).setTo, setTo = _a === void 0 ? null : _a;
    if (setTo) {
        return function hidePoweredBy(_req, res, next) {
            res.setHeader('X-Powered-By', setTo);
            next();
        };
    }
    else {
        return function hidePoweredBy(_req, res, next) {
            res.removeHeader('X-Powered-By');
            next();
        };
    }
};
