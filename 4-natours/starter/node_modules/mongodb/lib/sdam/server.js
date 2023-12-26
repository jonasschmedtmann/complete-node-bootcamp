"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const util_1 = require("util");
const connection_1 = require("../cmap/connection");
const connection_pool_1 = require("../cmap/connection_pool");
const errors_1 = require("../cmap/errors");
const constants_1 = require("../constants");
const error_1 = require("../error");
const mongo_types_1 = require("../mongo_types");
const transactions_1 = require("../transactions");
const utils_1 = require("../utils");
const common_1 = require("./common");
const monitor_1 = require("./monitor");
const server_description_1 = require("./server_description");
const stateTransition = (0, utils_1.makeStateMachine)({
    [common_1.STATE_CLOSED]: [common_1.STATE_CLOSED, common_1.STATE_CONNECTING],
    [common_1.STATE_CONNECTING]: [common_1.STATE_CONNECTING, common_1.STATE_CLOSING, common_1.STATE_CONNECTED, common_1.STATE_CLOSED],
    [common_1.STATE_CONNECTED]: [common_1.STATE_CONNECTED, common_1.STATE_CLOSING, common_1.STATE_CLOSED],
    [common_1.STATE_CLOSING]: [common_1.STATE_CLOSING, common_1.STATE_CLOSED]
});
/** @internal */
class Server extends mongo_types_1.TypedEventEmitter {
    /**
     * Create a server
     */
    constructor(topology, description, options) {
        super();
        this.commandAsync = (0, util_1.promisify)((ns, cmd, options, 
        // callback type defines Document result because result is never nullish when it succeeds, otherwise promise rejects
        callback) => this.command(ns, cmd, options, callback));
        this.serverApi = options.serverApi;
        const poolOptions = { hostAddress: description.hostAddress, ...options };
        this.topology = topology;
        this.pool = new connection_pool_1.ConnectionPool(this, poolOptions);
        this.s = {
            description,
            options,
            state: common_1.STATE_CLOSED,
            operationCount: 0
        };
        for (const event of [...constants_1.CMAP_EVENTS, ...constants_1.APM_EVENTS]) {
            this.pool.on(event, (e) => this.emit(event, e));
        }
        this.pool.on(connection_1.Connection.CLUSTER_TIME_RECEIVED, (clusterTime) => {
            this.clusterTime = clusterTime;
        });
        if (this.loadBalanced) {
            this.monitor = null;
            // monitoring is disabled in load balancing mode
            return;
        }
        // create the monitor
        // TODO(NODE-4144): Remove new variable for type narrowing
        this.monitor = new monitor_1.Monitor(this, this.s.options);
        for (const event of constants_1.HEARTBEAT_EVENTS) {
            this.monitor.on(event, (e) => this.emit(event, e));
        }
        this.monitor.on('resetServer', (error) => markServerUnknown(this, error));
        this.monitor.on(Server.SERVER_HEARTBEAT_SUCCEEDED, (event) => {
            this.emit(Server.DESCRIPTION_RECEIVED, new server_description_1.ServerDescription(this.description.hostAddress, event.reply, {
                roundTripTime: calculateRoundTripTime(this.description.roundTripTime, event.duration)
            }));
            if (this.s.state === common_1.STATE_CONNECTING) {
                stateTransition(this, common_1.STATE_CONNECTED);
                this.emit(Server.CONNECT, this);
            }
        });
    }
    get clusterTime() {
        return this.topology.clusterTime;
    }
    set clusterTime(clusterTime) {
        this.topology.clusterTime = clusterTime;
    }
    get description() {
        return this.s.description;
    }
    get name() {
        return this.s.description.address;
    }
    get autoEncrypter() {
        if (this.s.options && this.s.options.autoEncrypter) {
            return this.s.options.autoEncrypter;
        }
        return;
    }
    get loadBalanced() {
        return this.topology.description.type === common_1.TopologyType.LoadBalanced;
    }
    /**
     * Initiate server connect
     */
    connect() {
        if (this.s.state !== common_1.STATE_CLOSED) {
            return;
        }
        stateTransition(this, common_1.STATE_CONNECTING);
        // If in load balancer mode we automatically set the server to
        // a load balancer. It never transitions out of this state and
        // has no monitor.
        if (!this.loadBalanced) {
            this.monitor?.connect();
        }
        else {
            stateTransition(this, common_1.STATE_CONNECTED);
            this.emit(Server.CONNECT, this);
        }
    }
    /** Destroy the server connection */
    destroy(options, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = { force: false };
        }
        options = Object.assign({}, { force: false }, options);
        if (this.s.state === common_1.STATE_CLOSED) {
            if (typeof callback === 'function') {
                callback();
            }
            return;
        }
        stateTransition(this, common_1.STATE_CLOSING);
        if (!this.loadBalanced) {
            this.monitor?.close();
        }
        this.pool.close(options, err => {
            stateTransition(this, common_1.STATE_CLOSED);
            this.emit('closed');
            if (typeof callback === 'function') {
                callback(err);
            }
        });
    }
    /**
     * Immediately schedule monitoring of this server. If there already an attempt being made
     * this will be a no-op.
     */
    requestCheck() {
        if (!this.loadBalanced) {
            this.monitor?.requestCheck();
        }
    }
    /**
     * Execute a command
     * @internal
     */
    command(ns, cmd, options, callback) {
        if (callback == null) {
            throw new error_1.MongoInvalidArgumentError('Callback must be provided');
        }
        if (ns.db == null || typeof ns === 'string') {
            throw new error_1.MongoInvalidArgumentError('Namespace must not be a string');
        }
        if (this.s.state === common_1.STATE_CLOSING || this.s.state === common_1.STATE_CLOSED) {
            callback(new error_1.MongoServerClosedError());
            return;
        }
        // Clone the options
        const finalOptions = Object.assign({}, options, { wireProtocolCommand: false });
        // There are cases where we need to flag the read preference not to get sent in
        // the command, such as pre-5.0 servers attempting to perform an aggregate write
        // with a non-primary read preference. In this case the effective read preference
        // (primary) is not the same as the provided and must be removed completely.
        if (finalOptions.omitReadPreference) {
            delete finalOptions.readPreference;
        }
        const session = finalOptions.session;
        const conn = session?.pinnedConnection;
        // NOTE: This is a hack! We can't retrieve the connections used for executing an operation
        //       (and prevent them from being checked back in) at the point of operation execution.
        //       This should be considered as part of the work for NODE-2882
        // NOTE:
        //       When incrementing operation count, it's important that we increment it before we
        //       attempt to check out a connection from the pool.  This ensures that operations that
        //       are waiting for a connection are included in the operation count.  Load balanced
        //       mode will only ever have a single server, so the operation count doesn't matter.
        //       Incrementing the operation count above the logic to handle load balanced mode would
        //       require special logic to decrement it again, or would double increment (the load
        //       balanced code makes a recursive call).  Instead, we increment the count after this
        //       check.
        if (this.loadBalanced && session && conn == null && isPinnableCommand(cmd, session)) {
            this.pool.checkOut((err, checkedOut) => {
                if (err || checkedOut == null) {
                    if (callback)
                        return callback(err);
                    return;
                }
                session.pin(checkedOut);
                this.command(ns, cmd, finalOptions, callback);
            });
            return;
        }
        this.incrementOperationCount();
        this.pool.withConnection(conn, (err, conn, cb) => {
            if (err || !conn) {
                this.decrementOperationCount();
                if (!err) {
                    return cb(new error_1.MongoRuntimeError('Failed to create connection without error'));
                }
                if (!(err instanceof errors_1.PoolClearedError)) {
                    this.handleError(err);
                }
                return cb(err);
            }
            conn.command(ns, cmd, finalOptions, makeOperationHandler(this, conn, cmd, finalOptions, (error, response) => {
                this.decrementOperationCount();
                cb(error, response);
            }));
        }, callback);
    }
    /**
     * Handle SDAM error
     * @internal
     */
    handleError(error, connection) {
        if (!(error instanceof error_1.MongoError)) {
            return;
        }
        const isStaleError = error.connectionGeneration && error.connectionGeneration < this.pool.generation;
        if (isStaleError) {
            return;
        }
        const isNetworkNonTimeoutError = error instanceof error_1.MongoNetworkError && !(error instanceof error_1.MongoNetworkTimeoutError);
        const isNetworkTimeoutBeforeHandshakeError = (0, error_1.isNetworkErrorBeforeHandshake)(error);
        const isAuthHandshakeError = error.hasErrorLabel(error_1.MongoErrorLabel.HandshakeError);
        if (isNetworkNonTimeoutError || isNetworkTimeoutBeforeHandshakeError || isAuthHandshakeError) {
            // In load balanced mode we never mark the server as unknown and always
            // clear for the specific service id.
            if (!this.loadBalanced) {
                error.addErrorLabel(error_1.MongoErrorLabel.ResetPool);
                markServerUnknown(this, error);
            }
            else if (connection) {
                this.pool.clear({ serviceId: connection.serviceId });
            }
        }
        else {
            if ((0, error_1.isSDAMUnrecoverableError)(error)) {
                if (shouldHandleStateChangeError(this, error)) {
                    const shouldClearPool = (0, utils_1.maxWireVersion)(this) <= 7 || (0, error_1.isNodeShuttingDownError)(error);
                    if (this.loadBalanced && connection && shouldClearPool) {
                        this.pool.clear({ serviceId: connection.serviceId });
                    }
                    if (!this.loadBalanced) {
                        if (shouldClearPool) {
                            error.addErrorLabel(error_1.MongoErrorLabel.ResetPool);
                        }
                        markServerUnknown(this, error);
                        process.nextTick(() => this.requestCheck());
                    }
                }
            }
        }
    }
    /**
     * Decrement the operation count, returning the new count.
     */
    decrementOperationCount() {
        return (this.s.operationCount -= 1);
    }
    /**
     * Increment the operation count, returning the new count.
     */
    incrementOperationCount() {
        return (this.s.operationCount += 1);
    }
}
/** @event */
Server.SERVER_HEARTBEAT_STARTED = constants_1.SERVER_HEARTBEAT_STARTED;
/** @event */
Server.SERVER_HEARTBEAT_SUCCEEDED = constants_1.SERVER_HEARTBEAT_SUCCEEDED;
/** @event */
Server.SERVER_HEARTBEAT_FAILED = constants_1.SERVER_HEARTBEAT_FAILED;
/** @event */
Server.CONNECT = constants_1.CONNECT;
/** @event */
Server.DESCRIPTION_RECEIVED = constants_1.DESCRIPTION_RECEIVED;
/** @event */
Server.CLOSED = constants_1.CLOSED;
/** @event */
Server.ENDED = constants_1.ENDED;
exports.Server = Server;
function calculateRoundTripTime(oldRtt, duration) {
    if (oldRtt === -1) {
        return duration;
    }
    const alpha = 0.2;
    return alpha * duration + (1 - alpha) * oldRtt;
}
function markServerUnknown(server, error) {
    // Load balancer servers can never be marked unknown.
    if (server.loadBalanced) {
        return;
    }
    if (error instanceof error_1.MongoNetworkError && !(error instanceof error_1.MongoNetworkTimeoutError)) {
        server.monitor?.reset();
    }
    server.emit(Server.DESCRIPTION_RECEIVED, new server_description_1.ServerDescription(server.description.hostAddress, undefined, { error }));
}
function isPinnableCommand(cmd, session) {
    if (session) {
        return (session.inTransaction() ||
            'aggregate' in cmd ||
            'find' in cmd ||
            'getMore' in cmd ||
            'listCollections' in cmd ||
            'listIndexes' in cmd);
    }
    return false;
}
function connectionIsStale(pool, connection) {
    if (connection.serviceId) {
        return (connection.generation !== pool.serviceGenerations.get(connection.serviceId.toHexString()));
    }
    return connection.generation !== pool.generation;
}
function shouldHandleStateChangeError(server, err) {
    const etv = err.topologyVersion;
    const stv = server.description.topologyVersion;
    return (0, server_description_1.compareTopologyVersion)(stv, etv) < 0;
}
function inActiveTransaction(session, cmd) {
    return session && session.inTransaction() && !(0, transactions_1.isTransactionCommand)(cmd);
}
/** this checks the retryWrites option passed down from the client options, it
 * does not check if the server supports retryable writes */
function isRetryableWritesEnabled(topology) {
    return topology.s.options.retryWrites !== false;
}
function makeOperationHandler(server, connection, cmd, options, callback) {
    const session = options?.session;
    return function handleOperationResult(error, result) {
        // We should not swallow an error if it is present.
        if (error == null && result != null) {
            return callback(undefined, result);
        }
        if (options != null && 'noResponse' in options && options.noResponse === true) {
            return callback(undefined, null);
        }
        if (!error) {
            return callback(new error_1.MongoUnexpectedServerResponseError('Empty response with no error'));
        }
        if (!(error instanceof error_1.MongoError)) {
            // Node.js or some other error we have not special handling for
            return callback(error);
        }
        if (connectionIsStale(server.pool, connection)) {
            return callback(error);
        }
        if (error instanceof error_1.MongoNetworkError) {
            if (session && !session.hasEnded && session.serverSession) {
                session.serverSession.isDirty = true;
            }
            // inActiveTransaction check handles commit and abort.
            if (inActiveTransaction(session, cmd) &&
                !error.hasErrorLabel(error_1.MongoErrorLabel.TransientTransactionError)) {
                error.addErrorLabel(error_1.MongoErrorLabel.TransientTransactionError);
            }
            if ((isRetryableWritesEnabled(server.topology) || (0, transactions_1.isTransactionCommand)(cmd)) &&
                (0, utils_1.supportsRetryableWrites)(server) &&
                !inActiveTransaction(session, cmd)) {
                error.addErrorLabel(error_1.MongoErrorLabel.RetryableWriteError);
            }
        }
        else {
            if ((isRetryableWritesEnabled(server.topology) || (0, transactions_1.isTransactionCommand)(cmd)) &&
                (0, error_1.needsRetryableWriteLabel)(error, (0, utils_1.maxWireVersion)(server)) &&
                !inActiveTransaction(session, cmd)) {
                error.addErrorLabel(error_1.MongoErrorLabel.RetryableWriteError);
            }
        }
        if (session &&
            session.isPinned &&
            error.hasErrorLabel(error_1.MongoErrorLabel.TransientTransactionError)) {
            session.unpin({ force: true });
        }
        server.handleError(error, connection);
        return callback(error);
    };
}
//# sourceMappingURL=server.js.map