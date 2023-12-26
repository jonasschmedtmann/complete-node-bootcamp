SpecHelpers = {
  makeHeader: function(content) {
    return "Content-Length: " + content.length + "\r\n\r\n";
  },

  makeResponse: function(content) {
    return SpecHelpers.makeHeader(content) + content;
  }
};

JSpec.include({
  beforeSpec: function() {
    ndb = require("ndb");
    ndb.reset();
    ndb.Commands.List.context = 2;

    connection = {
      setEncoding: function() {},
      addListener: function() {}
    };

    tcp = {
      createConnection: function() {
        return connection;
      }
    };

    ndb.Helpers.tcp = tcp;

    stdinStream = {
      addListener: function() {}
    };

    mock_process = {
      openStdin: function() {
        return {
          setEncoding: function() {},
          addListener: function() {}
        };
      }
    };

    ndb.Helpers.process = mock_process;
    ndb.Helpers.puts    = function() {};
    ndb.Helpers.print   = function() {};
  }
});


