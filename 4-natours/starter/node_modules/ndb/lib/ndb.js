var ndb = exports;

ndb.version = "0.2.4";

ndb.setup = function() {
  if (!ndb.loaded) {
    this.reset();
  }
};

ndb.reset = function() {
  this.loaded  = true;
  this.host    = "127.0.0.1";
  this.port    = 5858;
  this.verbose = false;

  this.State.reset();
  this.EventListener.reset();
  this.CommandCenter.reset();
  this.Commands.List.reset();
};

ndb.State = {
  reset: function() {
    this.filename   = null;
    this.lineNumber = null;
    this.replOn     = false;
    this.history    = [];
  }
};

ndb.Helpers           = require("./ndb/helpers");
ndb.Commands          = require("./ndb/commands");
ndb.CommandCenter     = require("./ndb/command_center");
ndb.EventListener     = require("./ndb/event_listener");
ndb.MessageParser     = require("./ndb/message_parser");
ndb.OptionParser      = require("./ndb/option_parser");

var main = require("./ndb/main");

ndb.setup();

for (key in main) {
  if (main.hasOwnProperty(key)) {
    ndb[key] = main[key];
  }
}
