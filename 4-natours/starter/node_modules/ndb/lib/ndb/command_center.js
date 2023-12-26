var ndb = require("ndb");

var parse_command = function(command, text, fun) {
  var match = new RegExp("^" + command + " " + "(.+)").exec(text);

  if (match === null) {
    return false;
  } else {
    return match[1];
  }
};

exports.commands = ndb.Commands;

exports.reset = function() {
  this.lastCommand = null;
};

exports.parse = function(text) {
  var puts     = ndb.Helpers.puts,
      commands = this.commands,
      result   = false,
      command,
      i;

  text = text.trim();

  if (text === "" && this.lastCommand) {
    return this.lastCommand;
  }

  for (i in this.commands) {
    command = commands[i];

    if (command.parseCommand) {
      result = command.parseCommand(text);
      if (result) {
        ndb.State.history.push(text);
        this.lastCommand = result;
        return result;
      }
    }
  }

  this.lastCommand = null;

  return [commands.Help];
};

exports.stdinListener = function(text) {
  ndb = require("ndb");

  if (!ndb.State.replOn) {
    var pair = this.parse(text);

    if (pair instanceof Array) {
      pair[0].run(pair[1]);
    }
  }
};

exports.loop = function() {
  var process = ndb.Helpers.process,
      stdin;

  this.commands.connection = this.connection;
  stdin = process.openStdin();
  stdin.setEncoding("ascii");

  var self = this;

  stdin.addListener("data", function() {
    self.stdinListener.apply(self, arguments);
  });
};
