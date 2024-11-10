"use strict";
function transformDirectivesForPreCsp1Firefox(directives, basePolicy) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var result = Object.assign({}, basePolicy);
    // Copy `connectSrc` to `xhrSrc`
    var connectSrc = directives.connectSrc;
    if (connectSrc) {
        result.xhrSrc = connectSrc;
    }
    // Copy everything else
    Object.keys(directives).forEach(function (key) {
        if (key !== 'connectSrc') {
            result[key] = directives[key];
        }
    });
    // Rename `scriptSrc` values `unsafe-inline` and `unsafe-eval`
    var scriptSrc = directives.scriptSrc;
    if (scriptSrc) {
        var optionsValues = [];
        if (scriptSrc.indexOf("'unsafe-inline'") !== -1) {
            optionsValues.push('inline-script');
        }
        if (scriptSrc.indexOf("'unsafe-eval'") !== -1) {
            optionsValues.push('eval-script');
        }
        if (optionsValues.length !== 0) {
            result.options = optionsValues;
        }
    }
    return result;
}
module.exports = function transformDirectivesForBrowser(browser, directives) {
    // For now, Firefox is the only browser that needs to be transformed.
    if (!browser || browser.getBrowserName() !== 'Firefox') {
        return directives;
    }
    var osName = browser.getOSName();
    if (osName === 'iOS') {
        return directives;
    }
    var browserVersion = parseFloat(browser.getBrowserVersion());
    if (osName === 'Android' && browserVersion < 25 ||
        browser.getPlatformType(true) === 'mobile' && browserVersion < 32) {
        return transformDirectivesForPreCsp1Firefox(directives, { defaultSrc: ['*'] });
    }
    else if (browserVersion >= 4 && browserVersion < 23) {
        var basePolicy = {};
        if (browserVersion < 5) {
            basePolicy.allow = ['*'];
            if (directives.defaultSrc) {
                basePolicy.allow = directives.defaultSrc;
                directives = Object.assign({}, directives);
                delete directives.defaultSrc;
            }
        }
        else {
            basePolicy.defaultSrc = ['*'];
        }
        return transformDirectivesForPreCsp1Firefox(directives, basePolicy);
    }
    else {
        return directives;
    }
};
