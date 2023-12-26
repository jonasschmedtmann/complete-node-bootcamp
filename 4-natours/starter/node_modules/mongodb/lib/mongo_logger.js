"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoLogger = exports.stringifyWithMaxLen = exports.createStdioLogger = exports.MongoLoggableComponent = exports.SEVERITY_LEVEL_MAP = exports.DEFAULT_MAX_DOCUMENT_LENGTH = exports.SeverityLevel = void 0;
const bson_1 = require("bson");
const util_1 = require("util");
const constants_1 = require("./constants");
const utils_1 = require("./utils");
/** @internal */
exports.SeverityLevel = Object.freeze({
    EMERGENCY: 'emergency',
    ALERT: 'alert',
    CRITICAL: 'critical',
    ERROR: 'error',
    WARNING: 'warn',
    NOTICE: 'notice',
    INFORMATIONAL: 'info',
    DEBUG: 'debug',
    TRACE: 'trace',
    OFF: 'off'
});
/** @internal */
exports.DEFAULT_MAX_DOCUMENT_LENGTH = 1000;
/** @internal */
class SeverityLevelMap extends Map {
    constructor(entries) {
        const newEntries = [];
        for (const [level, value] of entries) {
            newEntries.push([value, level]);
        }
        newEntries.push(...entries);
        super(newEntries);
    }
    getNumericSeverityLevel(severity) {
        return this.get(severity);
    }
    getSeverityLevelName(level) {
        return this.get(level);
    }
}
/** @internal */
exports.SEVERITY_LEVEL_MAP = new SeverityLevelMap([
    [exports.SeverityLevel.OFF, -Infinity],
    [exports.SeverityLevel.EMERGENCY, 0],
    [exports.SeverityLevel.ALERT, 1],
    [exports.SeverityLevel.CRITICAL, 2],
    [exports.SeverityLevel.ERROR, 3],
    [exports.SeverityLevel.WARNING, 4],
    [exports.SeverityLevel.NOTICE, 5],
    [exports.SeverityLevel.INFORMATIONAL, 6],
    [exports.SeverityLevel.DEBUG, 7],
    [exports.SeverityLevel.TRACE, 8]
]);
/** @internal */
exports.MongoLoggableComponent = Object.freeze({
    COMMAND: 'command',
    TOPOLOGY: 'topology',
    SERVER_SELECTION: 'serverSelection',
    CONNECTION: 'connection'
});
/**
 * Parses a string as one of SeverityLevel
 *
 * @param s - the value to be parsed
 * @returns one of SeverityLevel if value can be parsed as such, otherwise null
 */
function parseSeverityFromString(s) {
    const validSeverities = Object.values(exports.SeverityLevel);
    const lowerSeverity = s?.toLowerCase();
    if (lowerSeverity != null && validSeverities.includes(lowerSeverity)) {
        return lowerSeverity;
    }
    return null;
}
/** @internal */
function createStdioLogger(stream) {
    return {
        write: (log) => {
            stream.write((0, util_1.inspect)(log, { compact: true, breakLength: Infinity }), 'utf-8');
            return;
        }
    };
}
exports.createStdioLogger = createStdioLogger;
/**
 * resolves the MONGODB_LOG_PATH and mongodbLogPath options from the environment and the
 * mongo client options respectively. The mongodbLogPath can be either 'stdout', 'stderr', a NodeJS
 * Writable or an object which has a `write` method with the signature:
 * ```ts
 * write(log: Log): void
 * ```
 *
 * @returns the MongoDBLogWritable object to write logs to
 */
function resolveLogPath({ MONGODB_LOG_PATH }, { mongodbLogPath }) {
    if (typeof mongodbLogPath === 'string' && /^stderr$/i.test(mongodbLogPath)) {
        return createStdioLogger(process.stderr);
    }
    if (typeof mongodbLogPath === 'string' && /^stdout$/i.test(mongodbLogPath)) {
        return createStdioLogger(process.stdout);
    }
    if (typeof mongodbLogPath === 'object' && typeof mongodbLogPath?.write === 'function') {
        return mongodbLogPath;
    }
    if (MONGODB_LOG_PATH && /^stderr$/i.test(MONGODB_LOG_PATH)) {
        return createStdioLogger(process.stderr);
    }
    if (MONGODB_LOG_PATH && /^stdout$/i.test(MONGODB_LOG_PATH)) {
        return createStdioLogger(process.stdout);
    }
    return createStdioLogger(process.stderr);
}
function compareSeverity(s0, s1) {
    const s0Num = exports.SEVERITY_LEVEL_MAP.getNumericSeverityLevel(s0);
    const s1Num = exports.SEVERITY_LEVEL_MAP.getNumericSeverityLevel(s1);
    return s0Num < s1Num ? -1 : s0Num > s1Num ? 1 : 0;
}
/** @internal */
function stringifyWithMaxLen(value, maxDocumentLength) {
    const ejson = bson_1.EJSON.stringify(value);
    return maxDocumentLength !== 0 && ejson.length > maxDocumentLength
        ? `${ejson.slice(0, maxDocumentLength)}...`
        : ejson;
}
exports.stringifyWithMaxLen = stringifyWithMaxLen;
function isLogConvertible(obj) {
    const objAsLogConvertible = obj;
    // eslint-disable-next-line no-restricted-syntax
    return objAsLogConvertible.toLog !== undefined && typeof objAsLogConvertible.toLog === 'function';
}
function attachCommandFields(log, commandEvent) {
    log.commandName = commandEvent.commandName;
    log.requestId = commandEvent.requestId;
    log.driverConnectionId = commandEvent?.connectionId;
    const { host, port } = utils_1.HostAddress.fromString(commandEvent.address).toHostPort();
    log.serverHost = host;
    log.serverPort = port;
    if (commandEvent?.serviceId) {
        log.serviceId = commandEvent.serviceId.toHexString();
    }
    return log;
}
function attachConnectionFields(log, connectionPoolEvent) {
    const { host, port } = utils_1.HostAddress.fromString(connectionPoolEvent.address).toHostPort();
    log.serverHost = host;
    log.serverPort = port;
    return log;
}
function defaultLogTransform(logObject, maxDocumentLength = exports.DEFAULT_MAX_DOCUMENT_LENGTH) {
    let log = Object.create(null);
    switch (logObject.name) {
        case constants_1.COMMAND_STARTED:
            log = attachCommandFields(log, logObject);
            log.message = 'Command started';
            log.command = stringifyWithMaxLen(logObject.command, maxDocumentLength);
            log.databaseName = logObject.databaseName;
            return log;
        case constants_1.COMMAND_SUCCEEDED:
            log = attachCommandFields(log, logObject);
            log.message = 'Command succeeded';
            log.durationMS = logObject.duration;
            log.reply = stringifyWithMaxLen(logObject.reply, maxDocumentLength);
            return log;
        case constants_1.COMMAND_FAILED:
            log = attachCommandFields(log, logObject);
            log.message = 'Command failed';
            log.durationMS = logObject.duration;
            log.failure = logObject.failure;
            return log;
        case constants_1.CONNECTION_POOL_CREATED:
            log = attachConnectionFields(log, logObject);
            log.message = 'Connection pool created';
            if (logObject.options) {
                const { maxIdleTimeMS, minPoolSize, maxPoolSize, maxConnecting, waitQueueTimeoutMS } = logObject.options;
                log = {
                    ...log,
                    maxIdleTimeMS,
                    minPoolSize,
                    maxPoolSize,
                    maxConnecting,
                    waitQueueTimeoutMS
                };
            }
            return log;
        case constants_1.CONNECTION_POOL_READY:
            log = attachConnectionFields(log, logObject);
            log.message = 'Connection pool ready';
            return log;
        case constants_1.CONNECTION_POOL_CLEARED:
            log = attachConnectionFields(log, logObject);
            log.message = 'Connection pool cleared';
            if (logObject.serviceId?._bsontype === 'ObjectId') {
                log.serviceId = logObject.serviceId.toHexString();
            }
            return log;
        case constants_1.CONNECTION_POOL_CLOSED:
            log = attachConnectionFields(log, logObject);
            log.message = 'Connection pool closed';
            return log;
        case constants_1.CONNECTION_CREATED:
            log = attachConnectionFields(log, logObject);
            log.message = 'Connection created';
            log.driverConnectionId = logObject.connectionId;
            return log;
        case constants_1.CONNECTION_READY:
            log = attachConnectionFields(log, logObject);
            log.message = 'Connection ready';
            log.driverConnectionId = logObject.connectionId;
            return log;
        case constants_1.CONNECTION_CLOSED:
            log = attachConnectionFields(log, logObject);
            log.message = 'Connection closed';
            log.driverConnectionId = logObject.connectionId;
            switch (logObject.reason) {
                case 'stale':
                    log.reason = 'Connection became stale because the pool was cleared';
                    break;
                case 'idle':
                    log.reason =
                        'Connection has been available but unused for longer than the configured max idle time';
                    break;
                case 'error':
                    log.reason = 'An error occurred while using the connection';
                    if (logObject.error) {
                        log.error = logObject.error;
                    }
                    break;
                case 'poolClosed':
                    log.reason = 'Connection pool was closed';
                    break;
                default:
                    log.reason = `Unknown close reason: ${logObject.reason}`;
            }
            return log;
        case constants_1.CONNECTION_CHECK_OUT_STARTED:
            log = attachConnectionFields(log, logObject);
            log.message = 'Connection checkout started';
            return log;
        case constants_1.CONNECTION_CHECK_OUT_FAILED:
            log = attachConnectionFields(log, logObject);
            log.message = 'Connection checkout failed';
            switch (logObject.reason) {
                case 'poolClosed':
                    log.reason = 'Connection pool was closed';
                    break;
                case 'timeout':
                    log.reason = 'Wait queue timeout elapsed without a connection becoming available';
                    break;
                case 'connectionError':
                    log.reason = 'An error occurred while trying to establish a new connection';
                    if (logObject.error) {
                        log.error = logObject.error;
                    }
                    break;
                default:
                    log.reason = `Unknown close reason: ${logObject.reason}`;
            }
            return log;
        case constants_1.CONNECTION_CHECKED_OUT:
            log = attachConnectionFields(log, logObject);
            log.message = 'Connection checked out';
            log.driverConnectionId = logObject.connectionId;
            return log;
        case constants_1.CONNECTION_CHECKED_IN:
            log = attachConnectionFields(log, logObject);
            log.message = 'Connection checked in';
            log.driverConnectionId = logObject.connectionId;
            return log;
        default:
            for (const [key, value] of Object.entries(logObject)) {
                if (value != null)
                    log[key] = value;
            }
    }
    return log;
}
/** @internal */
class MongoLogger {
    constructor(options) {
        /**
         * This method should be used when logging errors that do not have a public driver API for
         * reporting errors.
         */
        this.error = this.log.bind(this, 'error');
        /**
         * This method should be used to log situations where undesirable application behaviour might
         * occur. For example, failing to end sessions on `MongoClient.close`.
         */
        this.warn = this.log.bind(this, 'warn');
        /**
         * This method should be used to report high-level information about normal driver behaviour.
         * For example, the creation of a `MongoClient`.
         */
        this.info = this.log.bind(this, 'info');
        /**
         * This method should be used to report information that would be helpful when debugging an
         * application. For example, a command starting, succeeding or failing.
         */
        this.debug = this.log.bind(this, 'debug');
        /**
         * This method should be used to report fine-grained details related to logic flow. For example,
         * entering and exiting a function body.
         */
        this.trace = this.log.bind(this, 'trace');
        this.componentSeverities = options.componentSeverities;
        this.maxDocumentLength = options.maxDocumentLength;
        this.logDestination = options.logDestination;
    }
    log(severity, component, message) {
        if (compareSeverity(severity, this.componentSeverities[component]) > 0)
            return;
        let logMessage = { t: new Date(), c: component, s: severity };
        if (typeof message === 'string') {
            logMessage.message = message;
        }
        else if (typeof message === 'object') {
            if (isLogConvertible(message)) {
                logMessage = { ...logMessage, ...message.toLog() };
            }
            else {
                logMessage = { ...logMessage, ...defaultLogTransform(message, this.maxDocumentLength) };
            }
        }
        this.logDestination.write(logMessage);
    }
    /**
     * Merges options set through environment variables and the MongoClient, preferring environment
     * variables when both are set, and substituting defaults for values not set. Options set in
     * constructor take precedence over both environment variables and MongoClient options.
     *
     * @remarks
     * When parsing component severity levels, invalid values are treated as unset and replaced with
     * the default severity.
     *
     * @param envOptions - options set for the logger from the environment
     * @param clientOptions - options set for the logger in the MongoClient options
     * @returns a MongoLoggerOptions object to be used when instantiating a new MongoLogger
     */
    static resolveOptions(envOptions, clientOptions) {
        // client options take precedence over env options
        const combinedOptions = {
            ...envOptions,
            ...clientOptions,
            mongodbLogPath: resolveLogPath(envOptions, clientOptions)
        };
        const defaultSeverity = parseSeverityFromString(combinedOptions.MONGODB_LOG_ALL) ?? exports.SeverityLevel.OFF;
        return {
            componentSeverities: {
                command: parseSeverityFromString(combinedOptions.MONGODB_LOG_COMMAND) ?? defaultSeverity,
                topology: parseSeverityFromString(combinedOptions.MONGODB_LOG_TOPOLOGY) ?? defaultSeverity,
                serverSelection: parseSeverityFromString(combinedOptions.MONGODB_LOG_SERVER_SELECTION) ?? defaultSeverity,
                connection: parseSeverityFromString(combinedOptions.MONGODB_LOG_CONNECTION) ?? defaultSeverity,
                default: defaultSeverity
            },
            maxDocumentLength: (0, utils_1.parseUnsignedInteger)(combinedOptions.MONGODB_LOG_MAX_DOCUMENT_LENGTH) ?? 1000,
            logDestination: combinedOptions.mongodbLogPath
        };
    }
}
exports.MongoLogger = MongoLogger;
//# sourceMappingURL=mongo_logger.js.map