"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeDeleteStatement = exports.DeleteManyOperation = exports.DeleteOneOperation = exports.DeleteOperation = void 0;
const error_1 = require("../error");
const command_1 = require("./command");
const operation_1 = require("./operation");
/** @internal */
class DeleteOperation extends command_1.CommandCallbackOperation {
    constructor(ns, statements, options) {
        super(undefined, options);
        this.options = options;
        this.ns = ns;
        this.statements = statements;
    }
    get canRetryWrite() {
        if (super.canRetryWrite === false) {
            return false;
        }
        return this.statements.every(op => (op.limit != null ? op.limit > 0 : true));
    }
    executeCallback(server, session, callback) {
        const options = this.options ?? {};
        const ordered = typeof options.ordered === 'boolean' ? options.ordered : true;
        const command = {
            delete: this.ns.collection,
            deletes: this.statements,
            ordered
        };
        if (options.let) {
            command.let = options.let;
        }
        // we check for undefined specifically here to allow falsy values
        // eslint-disable-next-line no-restricted-syntax
        if (options.comment !== undefined) {
            command.comment = options.comment;
        }
        const unacknowledgedWrite = this.writeConcern && this.writeConcern.w === 0;
        if (unacknowledgedWrite) {
            if (this.statements.find((o) => o.hint)) {
                // TODO(NODE-3541): fix error for hint with unacknowledged writes
                callback(new error_1.MongoCompatibilityError(`hint is not supported with unacknowledged writes`));
                return;
            }
        }
        super.executeCommandCallback(server, session, command, callback);
    }
}
exports.DeleteOperation = DeleteOperation;
class DeleteOneOperation extends DeleteOperation {
    constructor(collection, filter, options) {
        super(collection.s.namespace, [makeDeleteStatement(filter, { ...options, limit: 1 })], options);
    }
    executeCallback(server, session, callback) {
        super.executeCallback(server, session, (err, res) => {
            if (err || res == null)
                return callback(err);
            if (res.code)
                return callback(new error_1.MongoServerError(res));
            if (res.writeErrors)
                return callback(new error_1.MongoServerError(res.writeErrors[0]));
            if (this.explain)
                return callback(undefined, res);
            callback(undefined, {
                acknowledged: this.writeConcern?.w !== 0 ?? true,
                deletedCount: res.n
            });
        });
    }
}
exports.DeleteOneOperation = DeleteOneOperation;
class DeleteManyOperation extends DeleteOperation {
    constructor(collection, filter, options) {
        super(collection.s.namespace, [makeDeleteStatement(filter, options)], options);
    }
    executeCallback(server, session, callback) {
        super.executeCallback(server, session, (err, res) => {
            if (err || res == null)
                return callback(err);
            if (res.code)
                return callback(new error_1.MongoServerError(res));
            if (res.writeErrors)
                return callback(new error_1.MongoServerError(res.writeErrors[0]));
            if (this.explain)
                return callback(undefined, res);
            callback(undefined, {
                acknowledged: this.writeConcern?.w !== 0 ?? true,
                deletedCount: res.n
            });
        });
    }
}
exports.DeleteManyOperation = DeleteManyOperation;
function makeDeleteStatement(filter, options) {
    const op = {
        q: filter,
        limit: typeof options.limit === 'number' ? options.limit : 0
    };
    if (options.collation) {
        op.collation = options.collation;
    }
    if (options.hint) {
        op.hint = options.hint;
    }
    return op;
}
exports.makeDeleteStatement = makeDeleteStatement;
(0, operation_1.defineAspects)(DeleteOperation, [operation_1.Aspect.RETRYABLE, operation_1.Aspect.WRITE_OPERATION]);
(0, operation_1.defineAspects)(DeleteOneOperation, [
    operation_1.Aspect.RETRYABLE,
    operation_1.Aspect.WRITE_OPERATION,
    operation_1.Aspect.EXPLAINABLE,
    operation_1.Aspect.SKIP_COLLATION
]);
(0, operation_1.defineAspects)(DeleteManyOperation, [
    operation_1.Aspect.WRITE_OPERATION,
    operation_1.Aspect.EXPLAINABLE,
    operation_1.Aspect.SKIP_COLLATION
]);
//# sourceMappingURL=delete.js.map