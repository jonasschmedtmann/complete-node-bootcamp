describe("NodeDebugger", function() {
  describe("Commands", function() {
    describe("Breakpoint", function() {
      before_each(function() {
        breakpoint = commands.SetBreakpoint;

        expected_object = {
          type:    "request",
          command: "setbreakpoint",
          arguments: {
            type:   "script",
            target: "filename.js",
            line:   16
          }
        };

        obj = {};

        spy.stub(ndb.Commands.RawWrite, "run", function(arg) {
          obj = arg;
        });
      });

      it("should raw write the json with the filename + fileno", function() {
        breakpoint.run({filename: "filename.js", lineNumber: 17});
        _.isEqual(obj, expected_object).should.be(true);
      });

      it('should use the correct filename + lineno', function() {
        breakpoint.run({filename: "foo.js", lineNumber: 20});
        obj.arguments.target.should.equal("foo.js");
        obj.arguments.line.should.equal(19);
      });

      it("should use the current filename if none is provided", function() {
        ndb.State.filename = "/my/filename.js";

        breakpoint.run({lineNumber: 20});

        obj.arguments.target.should.equal("/my/filename.js");
        obj.arguments.line.should.equal(19);
      });

      it("should use the current line number + filename if none provided", function() {
        ndb.State.filename = "/foo/bar.js";
        ndb.State.lineNumber = 10;

        breakpoint.run();
        obj.arguments.target.should.equal("/foo/bar.js");
        obj.arguments.line.should.equal(9);
      });

      it("should use line 1 if line number is not set", function() {
        breakpoint.run();
        obj.arguments.line.should.equal(0);
      });

      it("should not set the filename if not set (either globally or passed)", function() {
        breakpoint.run();
        obj.arguments.target.should.equal(null);
      });

      // The result of the setbreakpoint request is a response with the number of the newly created break point. This break point number is used in the changebreakpoint and clearbreakpoint requests.
      //
      // { "seq"         : <number>,
      //   "type"        : "response",
      //   "request_seq" : <number>,
      //   "command"     : "setbreakpoint",
      //   "body"        : { "type"       : <"function" or "script">
      //                     "breakpoint" : <break point number of the new break point>
      //                   }
      //   "running"     : <is the VM running after sending this response>
      //   "success"     : true
      // }
      // Here are a couple of examples.

      describe("receiving a breakpoint confirmation", function() {
        before_each(function() {
          msg = {
            type: "response",
            request_seq: 1,
            command: "setbreakpoint",
            body: {
              type: "script",
              breakpoint: 1
            },
            running: false,
            success: true
          };

          event_listener = ndb.EventListener;
          ndb.verbose = false;
        });

        it("should output the setbreakpoint confirmation", function() {
          spy.spyOn(ndb.Helpers, function() {
            event_listener.receive(SpecHelpers.makeResponse(JSON.stringify(msg)));

            spy.intercepted(ndb.Helpers, "puts", function(str) {
              str.should.equal("Breakpoint 1 set");
            });
          });
        });

        it("should output the correct breakpoint number", function() {
          msg.body.breakpoint = 2;

          spy.spyOn(ndb.Helpers, function() {
            event_listener.receive(SpecHelpers.makeResponse(JSON.stringify(msg)));

            spy.intercepted(ndb.Helpers, "puts", function(str) {
              str.should.equal("Breakpoint 2 set");
            });
          });
        });

        // ndb> break 10
        // verbose: >>> Content-Length: 140
        // verbose: >>>
        // verbose: >>> {"type":"request","command":"setbreakpoint","arguments":{"type":"script","target":"/Users/scotttaylor/src/git/ndb/spec/node.js","line":10}}
        // verbose: >>>
        // verbose: <<< Content-Length: 222
        // verbose: <<<
        // verbose: <<< {"seq":3,"type":"response","command":"setbreakpoint","success":true,"body":{"type":"scriptName","breakpoint":1,"script_name":"/Users/scotttaylor/src/git/ndb/spec/node.js","line":10,"column":null},"refs":[],"running":false}
        it("should output the script_name and line number when given", function() {
          msg.body.script_name = "/Users/scotttaylor/src/git/ndb/spec/node.js";
          msg.body.line        = 10;

          spy.spyOn(ndb.Helpers, function() {
            event_listener.receive(SpecHelpers.makeResponse(JSON.stringify(msg)));

            spy.intercepted(ndb.Helpers, "puts", function(str) {
              str.should.equal("Breakpoint 1 set at /Users/scotttaylor/src/git/ndb/spec/node.js:11");
            });
          });
        });

        it("should use the correct file + line no.", function() {
          msg.body.script_name = "/foo.js";
          msg.body.line        = 20;

          spy.spyOn(ndb.Helpers, function() {
            event_listener.receive(SpecHelpers.makeResponse(JSON.stringify(msg)));

            spy.intercepted(ndb.Helpers, "puts", function(str) {
              str.should.equal("Breakpoint 1 set at /foo.js:21");
            });
          });
        });

        it("should output the filename without a line number if no lineno is given", function() {
          msg.body.script_name = "/foo.js";

          spy.spyOn(ndb.Helpers, function() {
            event_listener.receive(SpecHelpers.makeResponse(JSON.stringify(msg)));

            spy.intercepted(ndb.Helpers, "puts", function(str) {
              str.should.equal("Breakpoint 1 set at /foo.js");
            });
          });
        });
      });
    });
  });
});
