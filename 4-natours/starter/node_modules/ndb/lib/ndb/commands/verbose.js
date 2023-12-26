var ndb = require("ndb");

exports.ndb = ndb;

exports.commandNames = ["verbose"];

exports.parseCommand = function(text) {
  return this.ndb.Helpers.commonParse.call(this, text);
};

function toggle(obj, value) {
  obj[value] = !obj[value];
}

function boolToName(value) {
  return (value ? "on" : "off");
}

exports.run = function() {
  var ndb    = this.ndb,
      puts   = ndb.Helpers.puts,
      prompt = ndb.Helpers.prompt;

  toggle(ndb, "verbose");
  puts("verbose mode now " + boolToName(ndb.verbose));
  prompt();
};
