"use strict";
function getHeaderValueFromOptions(options) {
    var DEFAULT_POLICY = 'no-referrer';
    var ALLOWED_POLICIES = [
        'no-referrer',
        'no-referrer-when-downgrade',
        'same-origin',
        'origin',
        'strict-origin',
        'origin-when-cross-origin',
        'strict-origin-when-cross-origin',
        'unsafe-url',
        ''
    ];
    options = options || {};
    var policyOption;
    if ('policy' in options) {
        policyOption = options.policy;
    }
    else {
        policyOption = DEFAULT_POLICY;
    }
    var policies = Array.isArray(policyOption) ? policyOption : [policyOption];
    if (policies.length === 0) {
        throw new Error('At least one policy must be supplied.');
    }
    var policiesSeen = new Set();
    policies.forEach(function (policy) {
        if ((typeof policy !== 'string') || (ALLOWED_POLICIES.indexOf(policy) === -1)) {
            var allowedPoliciesErrorList = ALLOWED_POLICIES.map(function (policy) {
                if (policy.length) {
                    return "\"" + policy + "\"";
                }
                else {
                    return 'and the empty string';
                }
            }).join(', ');
            throw new Error("\"" + policy + "\" is not a valid policy. Allowed policies: " + allowedPoliciesErrorList + ".");
        }
        if (policiesSeen.has(policy)) {
            throw new Error("\"" + policy + "\" specified more than once. No duplicates are allowed.");
        }
        policiesSeen.add(policy);
    });
    return policies.join(',');
}
module.exports = function referrerPolicy(options) {
    var headerValue = getHeaderValueFromOptions(options);
    return function referrerPolicy(_req, res, next) {
        res.setHeader('Referrer-Policy', headerValue);
        next();
    };
};
