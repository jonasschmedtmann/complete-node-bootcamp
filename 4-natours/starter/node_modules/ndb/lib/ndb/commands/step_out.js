var step = require("ndb/commands/step");

exports.commandNames = ["so", "stepout"];
exports.stepAction   = "out";

for (var key in step) {
  exports[key] = step[key];
}