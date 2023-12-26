var ndb = require("ndb");

exports.commandNames = ["repl"];

exports.parseCommand = function(text) {
  if (/(repl)/.exec(text)) {
    return [this];
  }
};

exports.execute = function(str) {
  var eval = ndb.Commands.Evaluate;

  if (str.trim() === ".break") {
    return false;
  } else {
    eval.run(str, true);
  }

  return true;
};

var printHelp = function() {
  var puts = ndb.Helpers.puts,
      str = "";

  str += "Welcome to the ndb repl.\n";
  str += "Type .break to exit.";

  puts(str);
};

exports.run = function(callback) {
  var replPrompt = ndb.Helpers.replPrompt,
      process = ndb.Helpers.process,
      listener,
      removeListener,
      stdin;

  listener = function(str) {
    if (!exports.execute(str)) {
      removeListener();
    }
  };

  removeListener = function() {
    stdin.removeListener("data", listener);
    ndb.State.replOn = false;
    ndb.Helpers.prompt();
  };

  ndb.State.replOn = true;

  printHelp();
  replPrompt();

  stdin = process.openStdin();
  stdin.setEncoding("ascii");
  stdin.addListener("data", listener);
};