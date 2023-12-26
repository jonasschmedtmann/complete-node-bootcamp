"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoEncryptionLoggerLevel = exports.aws4 = exports.saslprep = exports.getSnappy = exports.getAwsCredentialProvider = exports.getZstdLibrary = exports.ZStandard = exports.getKerberos = exports.Kerberos = void 0;
const error_1 = require("./error");
function makeErrorModule(error) {
    const props = error ? { kModuleError: error } : {};
    return new Proxy(props, {
        get: (_, key) => {
            if (key === 'kModuleError') {
                return error;
            }
            throw error;
        },
        set: () => {
            throw error;
        }
    });
}
exports.Kerberos = makeErrorModule(new error_1.MongoMissingDependencyError('Optional module `kerberos` not found. Please install it to enable kerberos authentication'));
function getKerberos() {
    try {
        // Ensure you always wrap an optional require in the try block NODE-3199
        exports.Kerberos = require('kerberos');
        return exports.Kerberos;
    }
    catch {
        return exports.Kerberos;
    }
}
exports.getKerberos = getKerberos;
exports.ZStandard = makeErrorModule(new error_1.MongoMissingDependencyError('Optional module `@mongodb-js/zstd` not found. Please install it to enable zstd compression'));
function getZstdLibrary() {
    try {
        exports.ZStandard = require('@mongodb-js/zstd');
        return exports.ZStandard;
    }
    catch {
        return exports.ZStandard;
    }
}
exports.getZstdLibrary = getZstdLibrary;
function getAwsCredentialProvider() {
    try {
        // Ensure you always wrap an optional require in the try block NODE-3199
        const credentialProvider = require('@aws-sdk/credential-providers');
        return credentialProvider;
    }
    catch {
        return makeErrorModule(new error_1.MongoMissingDependencyError('Optional module `@aws-sdk/credential-providers` not found.' +
            ' Please install it to enable getting aws credentials via the official sdk.'));
    }
}
exports.getAwsCredentialProvider = getAwsCredentialProvider;
function getSnappy() {
    try {
        // Ensure you always wrap an optional require in the try block NODE-3199
        const value = require('snappy');
        return value;
    }
    catch (cause) {
        const kModuleError = new error_1.MongoMissingDependencyError('Optional module `snappy` not found. Please install it to enable snappy compression', { cause });
        return { kModuleError };
    }
}
exports.getSnappy = getSnappy;
exports.saslprep = makeErrorModule(new error_1.MongoMissingDependencyError('Optional module `saslprep` not found.' +
    ' Please install it to enable Stringprep Profile for User Names and Passwords'));
try {
    // Ensure you always wrap an optional require in the try block NODE-3199
    exports.saslprep = require('@mongodb-js/saslprep');
}
catch { } // eslint-disable-line
exports.aws4 = makeErrorModule(new error_1.MongoMissingDependencyError('Optional module `aws4` not found. Please install it to enable AWS authentication'));
try {
    // Ensure you always wrap an optional require in the try block NODE-3199
    exports.aws4 = require('aws4');
}
catch { } // eslint-disable-line
/** @public */
exports.AutoEncryptionLoggerLevel = Object.freeze({
    FatalError: 0,
    Error: 1,
    Warning: 2,
    Info: 3,
    Trace: 4
});
//# sourceMappingURL=deps.js.map