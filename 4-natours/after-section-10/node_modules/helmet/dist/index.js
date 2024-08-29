"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var expect_ct_1 = __importDefault(require("./middlewares/expect-ct"));
var x_dns_prefetch_control_1 = __importDefault(require("./middlewares/x-dns-prefetch-control"));
var x_download_options_1 = __importDefault(require("./middlewares/x-download-options"));
var x_frame_options_1 = __importDefault(require("./middlewares/x-frame-options"));
var depd = require("depd");
var deprecate = depd("helmet");
var DEFAULT_MIDDLEWARE = [
    "dnsPrefetchControl",
    "frameguard",
    "hidePoweredBy",
    "hsts",
    "ieNoOpen",
    "noSniff",
    "xssFilter",
];
var middlewares = [
    "contentSecurityPolicy",
    "dnsPrefetchControl",
    "expectCt",
    "featurePolicy",
    "frameguard",
    "hidePoweredBy",
    "hsts",
    "ieNoOpen",
    "noSniff",
    "permittedCrossDomainPolicies",
    "referrerPolicy",
    "xssFilter",
    "hpkp",
    "noCache",
];
function helmet(options) {
    if (options === void 0) { options = {}; }
    if (options.constructor.name === "IncomingMessage") {
        throw new Error("It appears you have done something like `app.use(helmet)`, but it should be `app.use(helmet())`.");
    }
    var stack = middlewares.reduce(function (result, middlewareName) {
        var middleware = helmet[middlewareName];
        var middlewareOptions = options[middlewareName];
        var isDefault = DEFAULT_MIDDLEWARE.indexOf(middlewareName) !== -1;
        if (middlewareOptions === false) {
            return result;
        }
        else if (middlewareOptions === true) {
            middlewareOptions = {};
        }
        if (middlewareOptions != null) {
            return result.concat(middleware(middlewareOptions));
        }
        else if (isDefault) {
            return result.concat(middleware({}));
        }
        return result;
    }, []);
    return function helmet(req, res, next) {
        var index = 0;
        function internalNext() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (args.length > 0) {
                next.apply(void 0, args);
                return;
            }
            var middleware = stack[index];
            if (!middleware) {
                return next();
            }
            index++;
            middleware(req, res, internalNext);
        }
        internalNext();
    };
}
helmet.contentSecurityPolicy = require("helmet-csp");
helmet.dnsPrefetchControl = x_dns_prefetch_control_1.default;
helmet.expectCt = expect_ct_1.default;
helmet.frameguard = x_frame_options_1.default;
helmet.hidePoweredBy = require("hide-powered-by");
helmet.hsts = require("hsts");
helmet.ieNoOpen = x_download_options_1.default;
helmet.noSniff = require("dont-sniff-mimetype");
helmet.permittedCrossDomainPolicies = require("helmet-crossdomain");
helmet.referrerPolicy = require("referrer-policy");
helmet.xssFilter = require("x-xss-protection");
helmet.featurePolicy = deprecate.function(require("feature-policy"), "helmet.featurePolicy is deprecated (along with the HTTP header) and will be removed in helmet@4. You can use the `feature-policy` module instead.");
helmet.hpkp = deprecate.function(require("hpkp"), "helmet.hpkp is deprecated and will be removed in helmet@4. You can use the `hpkp` module instead. For more, see https://github.com/helmetjs/helmet/issues/180.");
helmet.noCache = deprecate.function(require("nocache"), "helmet.noCache is deprecated and will be removed in helmet@4. You can use the `nocache` module instead. For more, see https://github.com/helmetjs/helmet/issues/215.");
module.exports = helmet;
