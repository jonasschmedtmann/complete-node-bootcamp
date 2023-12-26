"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbStatsOperation = exports.CollStatsOperation = void 0;
const command_1 = require("./command");
const operation_1 = require("./operation");
/**
 * Get all the collection statistics.
 * @internal
 */
class CollStatsOperation extends command_1.CommandCallbackOperation {
    /**
     * Construct a Stats operation.
     *
     * @param collection - Collection instance
     * @param options - Optional settings. See Collection.prototype.stats for a list of options.
     */
    constructor(collection, options) {
        super(collection, options);
        this.options = options ?? {};
        this.collectionName = collection.collectionName;
    }
    executeCallback(server, session, callback) {
        const command = { collStats: this.collectionName };
        if (this.options.scale != null) {
            command.scale = this.options.scale;
        }
        super.executeCommandCallback(server, session, command, callback);
    }
}
exports.CollStatsOperation = CollStatsOperation;
/** @internal */
class DbStatsOperation extends command_1.CommandCallbackOperation {
    constructor(db, options) {
        super(db, options);
        this.options = options;
    }
    executeCallback(server, session, callback) {
        const command = { dbStats: true };
        if (this.options.scale != null) {
            command.scale = this.options.scale;
        }
        super.executeCommandCallback(server, session, command, callback);
    }
}
exports.DbStatsOperation = DbStatsOperation;
(0, operation_1.defineAspects)(CollStatsOperation, [operation_1.Aspect.READ_OPERATION]);
(0, operation_1.defineAspects)(DbStatsOperation, [operation_1.Aspect.READ_OPERATION]);
//# sourceMappingURL=stats.js.map