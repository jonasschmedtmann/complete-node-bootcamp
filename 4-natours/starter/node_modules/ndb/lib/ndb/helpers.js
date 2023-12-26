var sys           = require("util"),
    tcp           = require("net"),
    child_process = require("child_process");
    ndb           = require("ndb");

exports.puts         = sys.puts;
exports.print        = sys.print;
exports.tcp          = tcp;
exports.process      = process;
exports.exit         = process.exit;
exports.setTimeout   = setTimeout;
exports.childProcess = child_process;

exports.log = function(str, repetition) {
  var lines = str.split("\n"),
      puts  = ndb.Helpers.puts,
      line,
      i;

  for (i = 0; i < lines.length; i++) {
    line = lines[i];
    puts(repetition + line);
  }
};

exports.prompt = function() {
  var print = ndb.Helpers.print;
  print("ndb> ");
};

exports.replPrompt = function() {
  var print = ndb.Helpers.print;
  print("repl> ");
};

exports.include = function(array, element) {
  return array.indexOf(element) !== -1;
};

exports.commonParse = function(text) {
  var include = ndb.Helpers.include;

  if (include(this.commandNames, text)) {
    return [this];
  }
};
