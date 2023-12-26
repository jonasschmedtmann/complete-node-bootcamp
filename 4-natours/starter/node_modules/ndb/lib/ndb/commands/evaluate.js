var ndb = require("ndb");

exports.ndb = ndb;

exports.commandNames = ["e", "eval", "p", "print"];

exports.parseCommand = function(text) {
  var regex = new RegExp("^(" + this.commandNames.join("|") + ") (.+)$"),
      match = regex.exec(text);

  if (match) {
    return [this, match[2]];
  }
};

var construct_expression = function(expr) {
  var str = "";
  str += "if (typeof(require) === 'undefined') {  \n";
  str += "  " + expr + "                          \n";
  str += "} else {                                \n";
  str += "  require('util').inspect(" + expr + "); \n";
  str += "}                                       \n";
  return str;
};

exports.__testing = {
  construct_expression: construct_expression
};

exports.run = function(expr, raw) {
  var ndb       = this.ndb,
      raw_write = ndb.Commands.RawWrite;

  if (raw === false || raw === undefined) {
    expr = construct_expression(expr);
  }

  raw_write.run({
    type:    "request",
    command: "evaluate",
    arguments: {
      expression: expr
    }
  });
};

exports.output = function(json) {
  var puts = this.ndb.Helpers.puts;

  if (json.success) {
    puts("=> " + json.body.text);
  } else {
    puts(json.message);
  }
};

exports.parseResponse = function(obj) {
  if (obj.command === "evaluate") {
    return this;
  }
};
