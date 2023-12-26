var ndb = require("ndb");

exports.ndb = ndb;

function constructSource(obj, puts) {
  var str = "";

  var body = obj.body;

  str += "Breakpoint at ";

  if (body.scriptData) {
    str += body.scriptData + ":";
  }

  str += (body.sourceLine + 1) + ":" + body.sourceColumn;
  str += " (in function " + body.functionName;

  if (body.breakpoints) {
    str += " - breakpoints: [" + body.breakpoints + "]";
  }

  str += ")";

  if (body.sourceLineText) {
    str += "\n";
    str += body.sourceLineText;
  }

  return str;
}

exports.output = function(json) {
  var ndb  = this.ndb,
      puts = ndb.Helpers.puts,
      script;

  if (json.body) {
    ndb.State.lineNumber = json.body.sourceLine + 1;

    if (json.body.script) {
      script = json.body.script;

      if (script.name) {
        ndb.State.filename = script.name;
      }
    }
  }

  puts(constructSource(json));
};

exports.parseResponse = function(obj) {
  if (obj.event === "break") {
    return this;
  }
};
