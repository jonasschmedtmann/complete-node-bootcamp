"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.check = void 0;
const chain_1 = require("../chain");
const context_builder_1 = require("../context-builder");
const utils_1 = require("../utils");
function check(fields = '', locations = [], message) {
    const builder = new context_builder_1.ContextBuilder()
        .setFields(Array.isArray(fields) ? fields : [fields])
        .setLocations(locations)
        .setMessage(message);
    const runner = new chain_1.ContextRunnerImpl(builder);
    const middleware = async (req, _res, next) => {
        try {
            await runner.run(req);
            next();
        }
        catch (e) {
            next(e);
        }
    };
    return Object.assign(middleware, utils_1.bindAll(runner), utils_1.bindAll(new chain_1.SanitizersImpl(builder, middleware)), utils_1.bindAll(new chain_1.ValidatorsImpl(builder, middleware)), utils_1.bindAll(new chain_1.ContextHandlerImpl(builder, middleware)), { builder });
}
exports.check = check;
