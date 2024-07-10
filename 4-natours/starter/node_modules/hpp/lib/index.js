'use strict';

var defaults = require('lodash/defaults');
var isString = require('lodash/isString');
var isArray = require('lodash/isArray');

var typeis = require('type-is');

/**
 * @public
 * @param {object} options
 * @param {boolean} [options.checkQuery]
 * @param {boolean} [options.checkBody]
 * @param {string} [options.checkBodyOnlyForContentType]
 * @param {string[]|string} [options.whitelist]
 * @return {function}
 */
module.exports = function (options) {

    options = defaults(options || {}, {
        checkQuery: true,
        checkBody: true,
        checkBodyOnlyForContentType: 'urlencoded',
        whitelist: null
    });

    if (isString(options.whitelist)) {
        options.whitelist = [ options.whitelist ];
    }

    if (options.whitelist !== null && !isArray(options.whitelist)) {
        console.error(
            '[HPP] ' +
            'Please pass either a string or an array to "options.whitelist". ' +
            'Deactivated the whitelist!'
        );
        options.whitelist = null;
    }

    if (isArray(options.whitelist)) {

        options.whitelist = options.whitelist.filter(function (elem) {

            if (!isString(elem)) {

                console.error(
                    '[HPP] ' +
                    'Please pass only strings into the "options.whitelist" array. ' +
                    'Removed the entry <' + elem + '>!'
                );

                return false;
            }

            return true;

        });

    }

    /**
     * @private
     * @param {object} req
     * @return {boolean}
     */
    function _correctContentType(req) {
        return typeis(req, options.checkBodyOnlyForContentType);
    }

    /**
     * @private
     * @param {string} keyReqPart e.g 'body' or 'query'
     * @param {string} keyPolluted e.g 'bodyPolluted' or 'queryPolluted'
     * @param {object} req
     */
    function _putAside(keyReqPart, keyPolluted, req) {

        var whitelist = options.whitelist;

        var reqPart = req[keyReqPart];
        var reqPolluted = req[keyPolluted];

        // Put aside only once in case multiple HPP middlewares are used
        if (reqPolluted === undefined) { // Check identical to lodash's isUndefined(reqPolluted)

            reqPolluted = req[keyPolluted] = {};

            var parameters = Object.keys(reqPart);

            for ( var i = 0, parametersLen = parameters.length; i < parametersLen; i+=1 ) {

                var paramKey = parameters[i];
                var paramValue = reqPart[paramKey];

                if (!isArray(paramValue)) {
                    continue;
                }

                // Put aside
                reqPolluted[paramKey] = paramValue;
                // Select the first parameter value
                reqPart[paramKey] = paramValue[paramValue.length-1];

            }

        }

        // Processed separately to allow multiple whitelists from multiple HPP middlewares as well as
        // for performance reasons
        if (whitelist !== null) { // Validation at top ensures whitelist is either null or an array

            for (var k = 0, whitelistLen = whitelist.length; k < whitelistLen; k += 1) {

                var whitelistedParam = whitelist[k];

                if (reqPolluted[whitelistedParam]) {
                    // Put back
                    reqPart[whitelistedParam] = reqPolluted[whitelistedParam];
                    delete reqPolluted[whitelistedParam];
                }

            }

        }

    }

    /**
     * @public
     * @param {object} req
     * @param {object} [req.query]
     * @param {object} [req.body]
     * @param {object} res
     * @param {function} next
     */
    return function hpp(req, res, next) {

        if (options.checkQuery && req.query) {
            _putAside('query', 'queryPolluted', req);
        }

        if (options.checkBody && req.body && _correctContentType(req)) {
            _putAside('body', 'bodyPolluted', req);
        }

        next();

    };

};

