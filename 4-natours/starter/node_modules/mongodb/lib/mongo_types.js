"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancellationToken = exports.TypedEventEmitter = void 0;
const events_1 = require("events");
/**
 * Typescript type safe event emitter
 * @public
 */
class TypedEventEmitter extends events_1.EventEmitter {
    /** @internal */
    emitAndLog(event, ...args) {
        this.emit(event, ...args);
        if (this.component)
            this.mongoLogger?.debug(this.component, args[0]);
    }
}
exports.TypedEventEmitter = TypedEventEmitter;
/** @public */
class CancellationToken extends TypedEventEmitter {
}
exports.CancellationToken = CancellationToken;
//# sourceMappingURL=mongo_types.js.map