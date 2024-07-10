"use strict";
module.exports = function nosniff() {
    return function nosniff(_req, res, next) {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        next();
    };
};
