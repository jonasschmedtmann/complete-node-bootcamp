var step = require("ndb/commands/step");

exports.commandNames = ["s", "step", "stepin"];
exports.stepAction   = "in";

for (var key in step) {
  exports[key] = step[key];
}