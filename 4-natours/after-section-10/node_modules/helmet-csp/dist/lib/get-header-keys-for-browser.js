"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var config_1 = __importDefault(require("./config"));
function goodBrowser() {
    return ['Content-Security-Policy'];
}
var handlersByBrowserName = {
    'Android Browser': function (browser) {
        var osVersionName = browser.getOS().versionName;
        if (osVersionName && parseFloat(osVersionName) < 4.4) {
            return [];
        }
        return ['Content-Security-Policy'];
    },
    Chrome: function (browser) {
        var browserVersion = parseFloat(browser.getBrowserVersion());
        if (browserVersion >= 14 && browserVersion < 25) {
            return ['X-WebKit-CSP'];
        }
        else if (browserVersion >= 25) {
            return ['Content-Security-Policy'];
        }
        else {
            return [];
        }
    },
    'Chrome Mobile': function (browser, options) {
        if (browser.getOSName() === 'iOS') {
            return ['Content-Security-Policy'];
        }
        else {
            return handlersByBrowserName['Android Browser'](browser, options);
        }
    },
    Firefox: function (browser) {
        var osName = browser.getOSName();
        if (osName === 'iOS') {
            return ['Content-Security-Policy'];
        }
        var browserVersion = parseFloat(browser.getBrowserVersion());
        if (osName === 'Android') {
            if (browserVersion >= 25) {
                return ['Content-Security-Policy'];
            }
            else {
                return ['X-Content-Security-Policy'];
            }
        }
        else if (browser.getPlatformType(true) === 'mobile') {
            // This is probably Firefox OS.
            if (browserVersion >= 32) {
                return ['Content-Security-Policy'];
            }
            else {
                return ['X-Content-Security-Policy'];
            }
        }
        else if (browserVersion >= 23) {
            return ['Content-Security-Policy'];
        }
        else if (browserVersion >= 4 && browserVersion < 23) {
            return ['X-Content-Security-Policy'];
        }
        else {
            return [];
        }
    },
    'Internet Explorer': function (browser) {
        var browserVersion = parseFloat(browser.getBrowserVersion());
        var header = browserVersion < 12 ? 'X-Content-Security-Policy' : 'Content-Security-Policy';
        return [header];
    },
    'Microsoft Edge': goodBrowser,
    'Microsoft Edge Mobile': goodBrowser,
    Opera: function (browser) {
        var browserVersion = parseFloat(browser.getBrowserVersion());
        if (browserVersion >= 15) {
            return ['Content-Security-Policy'];
        }
        else {
            return [];
        }
    },
    Safari: function (browser) {
        var browserVersion = parseFloat(browser.getBrowserVersion());
        if (browserVersion >= 7) {
            return ['Content-Security-Policy'];
        }
        else if (browserVersion >= 6) {
            return ['X-WebKit-CSP'];
        }
        else {
            return [];
        }
    },
};
module.exports = function getHeaderKeysForBrowser(browser, options) {
    if (!browser) {
        return config_1.default.allHeaders;
    }
    if (options.disableAndroid && browser.getOSName() === 'Android') {
        return [];
    }
    var browserName = browser.getBrowserName();
    if (Object.prototype.hasOwnProperty.call(handlersByBrowserName, browserName)) {
        return handlersByBrowserName[browserName](browser, options);
    }
    else {
        return config_1.default.allHeaders;
    }
};
