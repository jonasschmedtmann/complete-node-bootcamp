var ndb = require("ndb");

exports.ndb = ndb;

exports.commandNames = ["c", "continue"];

exports.parseCommand = function(text) {
  return this.ndb.Helpers.commonParse.call(this, text);
};

exports.run = function(json) {
  this.ndb.Commands.RawWrite.run({
    type:    "request",
    command: "continue"
  });
};
