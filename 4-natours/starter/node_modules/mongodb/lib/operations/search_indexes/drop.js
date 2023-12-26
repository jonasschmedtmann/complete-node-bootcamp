"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropSearchIndexOperation = void 0;
const operation_1 = require("../operation");
/** @internal */
class DropSearchIndexOperation extends operation_1.AbstractCallbackOperation {
    constructor(collection, name) {
        super();
        this.collection = collection;
        this.name = name;
    }
    executeCallback(server, session, callback) {
        const namespace = this.collection.fullNamespace;
        const command = {
            dropSearchIndex: namespace.collection
        };
        if (typeof this.name === 'string') {
            command.name = this.name;
        }
        server.command(namespace, command, { session }, err => {
            if (err) {
                callback(err);
                return;
            }
            callback();
        });
    }
}
exports.DropSearchIndexOperation = DropSearchIndexOperation;
//# sourceMappingURL=drop.js.map