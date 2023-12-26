"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSearchIndexOperation = void 0;
const operation_1 = require("../operation");
/** @internal */
class UpdateSearchIndexOperation extends operation_1.AbstractCallbackOperation {
    constructor(collection, name, definition) {
        super();
        this.collection = collection;
        this.name = name;
        this.definition = definition;
    }
    executeCallback(server, session, callback) {
        const namespace = this.collection.fullNamespace;
        const command = {
            updateSearchIndex: namespace.collection,
            name: this.name,
            definition: this.definition
        };
        server.command(namespace, command, { session }, err => {
            if (err) {
                callback(err);
                return;
            }
            callback();
        });
    }
}
exports.UpdateSearchIndexOperation = UpdateSearchIndexOperation;
//# sourceMappingURL=update.js.map