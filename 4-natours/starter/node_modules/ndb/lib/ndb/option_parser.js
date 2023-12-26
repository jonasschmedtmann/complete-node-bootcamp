var js_opts = require("./../vendor/js-opts/opts"),
    ndb     = require("./../ndb");

exports.opts = js_opts;

exports.parse = function() {
  this.opts.parse(this.options, [], true);
  ndb.start();
};

exports.options = [
  {
    "short": "v",
    "long": "version",
    description: "Print version and exit",
    callback: function() {
      ndb.Helpers.puts("ndb version 0.2.4");
      ndb.Helpers.exit();
    }
  },
  {
    "short": "p",
    "long": "port",
    description: "Set the port (default: 5858)",
    value: true,
    callback: function(value) {
      ndb.port = parseInt(value, "10");
    }
  },
  {
    "short": "h",
    "long": "host",
    description: "Set the host (default: 127.0.0.1)",
    value: true,
    callback: function(value) {
      ndb.host = value;
    }
  },
  {
    "long": "verbose",
    description: "Turn on verbose/debugging mode (default: off)",
    callback: function() {
      ndb.verbose = true;
    }
  },
  {
    "short": "l",
    "long": "local",
    description: "Shortcut for running $(node --debug-brk <myscript> &; ndb) locally.",
    value: true,
    callback: function(scriptName) {
      var puts  = ndb.Helpers.puts,
          spawn = ndb.Helpers.childProcess.spawn,
          cmd,
          args;

      cmd = "node";
      args = ["--debug-brk", scriptName];

      puts("Spawning process: " + "`" + cmd + " " + args.join(" ") + "`");
      spawn(cmd, args);
    }
  }
];
