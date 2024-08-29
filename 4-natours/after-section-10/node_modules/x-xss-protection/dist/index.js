"use strict";
function doesUserAgentMatchOldInternetExplorer(userAgent) {
    if (!userAgent) {
        return false;
    }
    var matches = /msie\s*(\d{1,2})/i.exec(userAgent);
    return matches ? parseFloat(matches[1]) < 9 : false;
}
function getHeaderValueFromOptions(options) {
    var directives = ['1'];
    var isBlockMode;
    if ('mode' in options) {
        if (options.mode === 'block') {
            isBlockMode = true;
        }
        else if (options.mode === null) {
            isBlockMode = false;
        }
        else {
            throw new Error('The `mode` option must be set to "block" or null.');
        }
    }
    else {
        isBlockMode = true;
    }
    if (isBlockMode) {
        directives.push('mode=block');
    }
    if (options.reportUri) {
        directives.push("report=" + options.reportUri);
    }
    return directives.join('; ');
}
module.exports = function xXssProtection(options) {
    if (options === void 0) { options = {}; }
    var headerValue = getHeaderValueFromOptions(options);
    if (options.setOnOldIE) {
        return function xXssProtection(_req, res, next) {
            res.setHeader('X-XSS-Protection', headerValue);
            next();
        };
    }
    else {
        return function xXssProtection(req, res, next) {
            var value = doesUserAgentMatchOldInternetExplorer(req.headers['user-agent']) ? '0' : headerValue;
            res.setHeader('X-XSS-Protection', value);
            next();
        };
    }
};
