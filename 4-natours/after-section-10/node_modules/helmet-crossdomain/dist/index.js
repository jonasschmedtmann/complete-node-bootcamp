"use strict";
function getHeaderValueFromOptions(options) {
    var DEFAULT_PERMITTED_POLICIES = 'none';
    var ALLOWED_POLICIES = [
        'none',
        'master-only',
        'by-content-type',
        'all',
    ];
    var permittedPolicies;
    if ('permittedPolicies' in options) {
        permittedPolicies = options.permittedPolicies;
    }
    else {
        permittedPolicies = DEFAULT_PERMITTED_POLICIES;
    }
    if (ALLOWED_POLICIES.indexOf(permittedPolicies) === -1) {
        throw new Error("\"" + permittedPolicies + "\" is not a valid permitted policy. Allowed values: " + ALLOWED_POLICIES.join(', ') + ".");
    }
    return permittedPolicies;
}
module.exports = function crossdomain(options) {
    if (options === void 0) { options = {}; }
    var headerValue = getHeaderValueFromOptions(options);
    return function crossdomain(_req, res, next) {
        res.setHeader('X-Permitted-Cross-Domain-Policies', headerValue);
        next();
    };
};
