describe("NodeDebugger", function() {
  describe("Commands", function() {
    describe("backtrace", function() {
      before_each(function() {
        backtrace = ndb.Commands.Backtrace;
      });

      describe("parsing", function() {
        it("should not parse with random text", function() {
          backtrace.parseCommand("fooasdfasd").should.equal(undefined);
        });

        it("should parse bt", function() {
          backtrace.parseCommand("bt")[0].should.equal(backtrace);
        });

        it("should parse backtrace", function() {
          backtrace.parseCommand("backtrace")[0].should.equal(backtrace);
        });
      });

      describe("running", function() {
        before_each(function() {
          raw_write = ndb.Commands.RawWrite;
          spy.stub(raw_write, "run");
        });

        // {"seq":117,"type":"request","command":"backtrace"}
        // {"seq":118,"type":"request","command":"backtrace","arguments":{"toFrame":2}}
        // {"seq":119,"type":"request","command":"backtrace","arguments":{"fromFrame":0,"toFrame":9}}
        it("should send the backtrace command", function() {
          spy.spyOn(raw_write, function() {
            backtrace.run();
            spy.intercepted(raw_write, "run", function(obj) {
              obj.type.should.equal("request");
              obj.command.should.equal("backtrace");
            });
          });
        });
      });

      describe("outputting the backtrace", function() {
        before_each(function() {
          fs = require("fs");
          file = fs.readFileSync(__dirname + "/../../fixtures/backtrace_one.js", "ascii");
          json = JSON.parse(file);
        });

        it("should have the calling module", function() {
          backtrace.ndb.should.equal(ndb);
        });

        it("should output the stacktrace", function() {
          output = fs.readFileSync(__dirname + "/../../fixtures/backtrace_one_output.txt", "ascii");

          spy.spyOn(node_debugger.Helpers, function() {
            backtrace.output(json);

            spy.intercepted(node_debugger.Helpers, "puts", function(str) {
              output.length.should.equal(str.length);
              output.should.equal(str);
            });
          });
        });
      });

      describe("recognizing the response", function() {
        it("should return itself if the command is a backtrace command", function() {
          var obj = {command: 'backtrace'};
          backtrace.parseResponse(obj).should.equal(backtrace);
        });

        it("should return undefined if it does not match a backtrace command", function() {
          backtrace.parseResponse({command: 'foobar'}).should.not.equal(backtrace);
        });
      });
    });
  });
});