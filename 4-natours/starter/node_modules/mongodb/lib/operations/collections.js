"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionsOperation = void 0;
const collection_1 = require("../collection");
const operation_1 = require("./operation");
/** @internal */
class CollectionsOperation extends operation_1.AbstractCallbackOperation {
    constructor(db, options) {
        super(options);
        this.options = options;
        this.db = db;
    }
    executeCallback(server, session, callback) {
        // Let's get the collection names
        this.db
            .listCollections({}, { ...this.options, nameOnly: true, readPreference: this.readPreference, session })
            .toArray()
            .then(documents => {
            const collections = [];
            for (const { name } of documents) {
                if (!name.includes('$')) {
                    // Filter collections removing any illegal ones
                    collections.push(new collection_1.Collection(this.db, name, this.db.s.options));
                }
            }
            // Return the collection objects
            callback(undefined, collections);
        }, error => callback(error));
    }
}
exports.CollectionsOperation = CollectionsOperation;
//# sourceMappingURL=collections.js.map