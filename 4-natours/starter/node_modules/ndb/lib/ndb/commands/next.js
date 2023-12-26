var ndb = require("ndb");

exports.ndb = ndb;

exports.commandNames = ["n", "next"];

exports.parseCommand = function(text) {
  var match = /^(n|next)(.*)$/.exec(text),
      args;

  if (match) {
    args = match[2].trim();

    if (args === "") {
      return [this];
    } else {
      return [this, match[2].trim()];
    }
  }
};

exports.run = function(stepcount) {
  var ndb = this.ndb,
      rw = ndb.Commands.RawWrite,
      obj;

  if (!stepcount) {
    stepcount = 1;
  }

  obj = {
    type: "request",
    command: "continue",
    arguments: {
      stepaction: "next",
      stepcount:  stepcount
    }
  };

  rw.run(obj);
};
