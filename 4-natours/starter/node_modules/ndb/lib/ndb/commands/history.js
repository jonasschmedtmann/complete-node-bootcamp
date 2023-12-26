var ndb = require("ndb");

exports.commandNames = ["history"];

exports.parseCommand = function(text) {
  return ndb.Helpers.commonParse.call(this, text);
};

var repeatString = function(str, times) {
  var newStr = "",
      i;

  for(i = 0; i < times; i++) {
    newStr += str;
  }

  return newStr;
};

var rjust = function(string, width) {
  string = string.toString();

  if (string.length < width) {
    return repeatString(" ", width - string.length) + string;
  } else {
    return string;
  }
};

exports.run = function() {
  var ndb     = require("ndb"),
      puts    = ndb.Helpers.puts,
      prompt  = ndb.Helpers.prompt,
      index   = 1;

  ndb.State.history.forEach(function(command) {
    puts(rjust(index, 5) + "  " + command);
    index++;
  });

  prompt();
};