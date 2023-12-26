"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateSearchIndexesOperation = void 0;
const operation_1 = require("../operation");
/** @internal */
class CreateSearchIndexesOperation extends operation_1.AbstractCallbackOperation {
    constructor(collection, descriptions) {
        super();
        this.collection = collection;
        this.descriptions = descriptions;
    }
    executeCallback(server, session, callback) {
        const namespace = this.collection.fullNamespace;
        const command = {
            createSearchIndexes: namespace.collection,
            indexes: this.descriptions
        };
        server.command(namespace, command, { session }, (err, res) => {
            if (err || !res) {
                callback(err);
                return;
            }
            const indexesCreated = res?.indexesCreated ?? [];
            callback(undefined, indexesCreated.map(({ name }) => name));
        });
    }
}
exports.CreateSearchIndexesOperation = CreateSearchIndexesOperation;
//# sourceMappingURL=create.js.map