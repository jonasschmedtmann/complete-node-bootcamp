var ndb = require("ndb");

exports.ndb = ndb;

exports.parseCommand = function(text) {
  var ndb = this.ndb;
  return ndb.Helpers.commonParse.call(this, text);
};

exports.run = function(stepcount) {
  var ndb = this.ndb,
      rw = ndb.Commands.RawWrite;

  if (stepcount === undefined) {
    stepcount = 1;
  }

  rw.run({
    type:    "request",
    command: "continue",
    arguments: {
      stepaction: this.stepAction,
      stepcount: stepcount
    }
  });
};