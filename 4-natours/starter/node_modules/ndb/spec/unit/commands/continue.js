describe("NodeDebugger", function() {
  describe("Commands", function() {
    describe("continue", function() {
      before_each(function() {
        connection = {
          write: function() {}
        };

        commands = ndb.Commands;
        commands.connection = connection;

        c = commands.Continue;
      });

      // {"seq":117,"type":"request","command":"continue"}
      // {"seq":118,"type":"request","command":"continue","arguments":{"stepaction":"out"}}
      // {"seq":119,"type":"request","command":"continue","arguments":{"stepaction":"next","stepcount":5}}
      it("should raw_write the continue command", function() {
        var obj = undefined;

        ndb.Commands.RawWrite = {
          run: function(o) {
            obj = o;
          }
        };

        var expected_object = {
          type:    "request",
          command: "continue"
        };

        c.run();

        JSON.stringify(obj).should.equal(JSON.stringify(expected_object));
      });
    });
  });
});
