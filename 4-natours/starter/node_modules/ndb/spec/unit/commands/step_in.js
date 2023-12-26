describe("NodeDebugger", function() {
  describe("Commands", function() {
    describe("step in", function() {
      describe("running", function() {
        before_each(function() {
          connection = {
            write: function() {}
          };

          commands = ndb.Commands;
          commands.connection = connection;

          c = commands.StepIn;
        });

        // {"seq":117,"type":"request","command":"continue"}
        // {"seq":118,"type":"request","command":"continue","arguments":{"stepaction":"out"}}
        // {"seq":119,"type":"request","command":"continue","arguments":{"stepaction":"next","stepcount":5}}

        // { "seq"       : <number>,
        //   "type"      : "request",
        //   "command"   : "continue",
        //   "arguments" : { "stepaction" : <"in", "next" or "out">,
        //                   "stepcount"  : <number of steps (default 1)>
        //                 }
        // }
        it("should raw_write the continue command", function() {
          var obj = undefined;

          spy.stub(ndb.Commands.RawWrite, "run", function(o) {
            obj = o;
          });

          var expected_object = {
            type:    "request",
            command: "continue",
            arguments: {
              stepaction: "in",
              stepcount: 1
            }
          };

          c.run();

          JSON.stringify(obj).should.equal(JSON.stringify(expected_object));
        });

        it("should use the stepcount given when one is given", function() {
          var obj = undefined;

          spy.stub(ndb.Commands.RawWrite, "run", function(o) {
            obj = o;
          });

          var expected_object = {
            type:    "request",
            command: "continue",
            arguments: {
              stepaction: "in",
              stepcount: 5
            }
          };

          c.run(5);

          JSON.stringify(obj).should.equal(JSON.stringify(expected_object));
        });
      });
    });
  });
});
