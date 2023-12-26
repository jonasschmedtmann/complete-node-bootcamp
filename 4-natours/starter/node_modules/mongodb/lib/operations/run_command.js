"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunAdminCommandOperation = exports.RunCommandOperation = void 0;
const utils_1 = require("../utils");
const command_1 = require("./command");
/** @internal */
class RunCommandOperation extends command_1.CommandCallbackOperation {
    constructor(parent, command, options) {
        super(parent, options);
        this.options = options ?? {};
        this.command = command;
    }
    executeCallback(server, session, callback) {
        const command = this.command;
        this.executeCommandCallback(server, session, command, callback);
    }
}
exports.RunCommandOperation = RunCommandOperation;
class RunAdminCommandOperation extends RunCommandOperation {
    constructor(parent, command, options) {
        super(parent, command, options);
        this.ns = new utils_1.MongoDBNamespace('admin');
    }
}
exports.RunAdminCommandOperation = RunAdminCommandOperation;
//# sourceMappingURL=run_command.js.map