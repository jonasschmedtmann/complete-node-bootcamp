"use strict";
function dashify(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .toLowerCase();
}
module.exports = function (_a) {
    var directives = _a.directives;
    var keysSeen = {};
    return Object.keys(directives).reduce(function (result, originalKey) {
        var directive = dashify(originalKey);
        if (keysSeen[directive]) {
            throw new Error(originalKey + " is specified more than once");
        }
        keysSeen[directive] = true;
        var value = directives[originalKey];
        if (Array.isArray(value)) {
            value = value.join(' ');
        }
        else if (value === true) {
            value = '';
        }
        else if (value === false) {
            return result;
        }
        if (value) {
            return result.concat(directive + " " + value);
        }
        else {
            return result.concat(directive);
        }
    }, []).join('; ');
};
