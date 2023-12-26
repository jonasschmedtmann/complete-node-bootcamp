describe('NodeDebugger', function() {
  describe('Client', function() {
    before_each(function() {
      command_center = {
        loop: function() {}
      };

      ndb.commandCenter = command_center;
    });

    describe("starting the debugger itself", function() {
      before_each(function() {
        connection = {};
      });

      it("should output welcome text", function() {
        var text = "";

        ndb.Helpers.puts = function(t) {
          text += t;
        };

        ndb.startDebugger(connection);

        text.search(/welcome to the node debugger!/).should.not.equal(-1);
      });

      it("should output the prompt", function() {
        var text = "";

        ndb.Helpers.print = function(t) {
          text += t;
        };

        ndb.startDebugger(connection);

        text.search(/ndb> /).should.not.equal(-1);
      });

      it("should set the command center's connection", function() {
        ndb.startDebugger(connection);

        command_center.connection.should.equal(connection);
      });

      it("should call the commandCenter's loop method", function() {
        var loop_called = false;

        command_center.loop = function() {
          loop_called = true;
        };

        ndb.startDebugger(connection);

        loop_called.should.be(true);
      });
    });

    describe("starting", function() {
      it("should establish the connection on port 5858 and 127.0.0.1", function() {
        var port_received = null,
            host_received = null;

        tcp.createConnection = function(port, host) {
          port_received = port;
          host_received = host;
          return connection;
        };

        ndb.start();
        port_received.should.equal(5858);
        host_received.should.equal("127.0.0.1");
      });

      it("should establish the connection on the correct port", function() {
        var port_received = null;

        ndb.port = 6000;

        tcp.createConnection = function(port) {
          port_received = port;
          return connection;
        };

        ndb.start();
        port_received.should.equal(6000);
      });

      it("should speak in ascii", function() {
        var encoding_received = null;

        connection.setEncoding = function(encoding) {
          encoding_received = encoding;
        };

        ndb.start();
        encoding_received.should.equal("ascii");
      });

      it("should install the connection's event listener", function() {
        var called = false;

        connection.addListener = function() {
          called = true;
        };

        ndb.start();
        called.should.be(true);
      });

      it("should listen for an end message", function() {
        var args = [];

        connection.addListener = function(msg, fun) {
          if (msg === "end") {
            args.push(msg);
            args.push(fun);
          }
        };

        ndb.start();

        args[0].should.equal("end");
        args[1].should.equal(ndb.Helpers.exit);
      });

      it("should listen for a connection error message", function() {
        var args = [];

        connection.addListener = function(msg, fun) {
          if (msg === "error") {
            args.push(msg);
            args.push(fun);
          }
        };

        ndb.start();

        args[0].should.equal("error");
        args[1].should.equal(ndb.restart);
      });

      describe("when there is an error", function() {
        before_each(function() {
          spy.stub(ndb.Helpers, "setTimeout");
        });

        it("should output that it is about to restart", function() {
          spy.spyOn(ndb.Helpers, function() {
            ndb.restart();

            spy.intercepted(ndb.Helpers, "puts", function(text) {
              text.should.equal("Could not connect to host 127.0.0.1 on port 5858.  Will try again in 2 seconds.");
            });
          });
        });

        it("should use the correct host + port in the error message", function() {
          ndb.host = "localhost";
          ndb.port = "2020";

          spy.spyOn(ndb.Helpers, function() {
            ndb.restart();

            spy.intercepted(ndb.Helpers, "puts", function(text) {
              text.should.equal("Could not connect to host localhost on port 2020.  Will try again in 2 seconds.");
            });
          });
        });

        it("should call start again in 2 seconds", function() {
          spy.spyOn(ndb.Helpers, function() {
            ndb.restart();
            spy.intercepted(ndb.Helpers, "setTimeout", ndb.start, 2000);
          });
        });
      });
    });
  });
});
