var ndb = require("ndb");

exports.ndb = ndb;

exports.commandNames = ["b", "break"];

exports.parseCommand = function(text) {
  var obj = {},
      array;

  if (text == "b" || text == "break") {
    return [this, obj];
  }

  var match = new RegExp("^b(reak)? (.+)").exec(text);

  if (match === null) {
    return false;
  } else {
    array = match[2].split(":");

    if (array.length === 1) {
      obj.lineNumber = array[0];
    } else {
      obj.filename = array[0];
      obj.lineNumber = array[1];
    }

    obj.lineNumber = parseInt(obj.lineNumber, "10");

    return([this, obj]);
  }
};

exports.run = function() {
  var obj = arguments[0] || {},
      ndb  = this.ndb,
      file = obj.filename || ndb.State.filename,
      line = obj.lineNumber || ndb.State.lineNumber || 1;

  ndb.Commands.RawWrite.run({
    type:    "request",
    command: "setbreakpoint",
    arguments: {
      type:   "script",
      target: file,
      // v8 starts counting at 0
      // so line 10 for us is really line 9 for them
      line:   line - 1
    }
  });
};

exports.parseResponse = function(obj) {
  if (obj.command === "setbreakpoint") {
    return this;
  }
};

exports.output = function(msg) {
  var ndb  = this.ndb,
      puts = ndb.Helpers.puts,
      str;

  str = "Breakpoint " + msg.body.breakpoint + " set";

  if (msg.body.script_name) {
    str += " at ";
    str += msg.body.script_name;

    if (msg.body.line) {
      str += ":";
      // v8 starts counting at 0
      // so line 0 for them is really line 1 for us
      str += msg.body.line + 1;
    }
  }

  puts(str);
};
