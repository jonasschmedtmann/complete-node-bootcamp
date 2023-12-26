var ndb = require("ndb");

exports.start = function() {
  var tcp           = ndb.Helpers.tcp,
      eventListener = ndb.eventListener || Object.create(ndb.EventListener);

  connection = tcp.createConnection(ndb.port, ndb.host);
  connection.setEncoding("ascii");

  connection.addListener("error", ndb.restart);

  connection.addListener("data", function() {
    eventListener.receive.apply(eventListener, arguments);
  });

  connection.addListener("end", ndb.Helpers.exit);

  connection.addListener("connect", function() {
    ndb.startDebugger(connection);
  });

  eventListener.verbose = this.verbose;

  return connection;
};

exports.restart = function() {
  var puts       = ndb.Helpers.puts,
      setTimeout = ndb.Helpers.setTimeout;

  puts("Could not connect to host " + ndb.host + " on port " + ndb.port + ".  Will try again in 2 seconds.");
  setTimeout(ndb.start, 2000);
};

exports.startDebugger = function(connection) {
  var puts          = ndb.Helpers.puts,
      prompt        = ndb.Helpers.prompt,
      commandCenter = this.commandCenter || Object.create(ndb.CommandCenter);

  commandCenter.connection = connection;

  // start the main repl loop
  puts("welcome to the node debugger!");
  prompt();
  commandCenter.loop();
};
