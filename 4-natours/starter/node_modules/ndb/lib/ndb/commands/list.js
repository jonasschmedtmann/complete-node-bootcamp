var ndb = require("ndb");

exports.ndb = ndb;

exports.commandNames = ["l", "list"];

exports.parseCommand = function(text) {
  return this.ndb.Helpers.commonParse.call(this, text);
};

exports.calculateContext = function(num) {
  var prev = num - this.context;

  if (prev < 1) {
    prev = 1;
  }

  return {
    posterior: prev,
    anterior:  prev + (this.context * 2)
  };
};

exports.run = function() {
  var ndb    = this.ndb,
      writer = ndb.Commands.RawWrite,
      lineNumber = ndb.State.lineNumber;

  if (!lineNumber) {
    lineNumber = 1;
  }

  var context = this.calculateContext(lineNumber);

  writer.run({
    type:    "request",
    command: "source",
    arguments: {
      fromLine: context.posterior - 1,
      toLine:   context.anterior
    }
  });
};

function fromUpto(start, end, fun) {
  var index   = 0,
      current = start;

  for (; current <= end; current++, index++) {
    fun(current, index);
  }
}

function constructString(obj, current_line) {
  var source    = obj.body.source.split("\n"),
      fromLine  = obj.body.fromLine + 1,
      toLine    = obj.body.toLine,
      str       = "";

  fromUpto(fromLine, toLine, function(sourceNum, counter) {
    if (sourceNum === current_line) {
      str += "=> ";
    } else {
      str += "   ";
    }

    str += sourceNum + " " + source[counter];

    if (sourceNum !== toLine) {
      str += "\n";
    }
  });

  return str;
}

exports.output = function(obj) {
  var ndb  = this.ndb,
      puts = ndb.Helpers.puts;

  puts(constructString(obj, ndb.State.lineNumber));
};

exports.parseResponse = function(obj) {
  if (obj.command === "source") {
    return this;
  }
};

exports.reset = function() {
  this.context = 4;
};

exports.reset();