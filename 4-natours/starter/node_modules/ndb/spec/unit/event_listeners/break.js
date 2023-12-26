describe("NodeDebugger", function() {
  describe("EventListener", function() {
    before_each(function() {
      event_listner = ndb.EventListener;
      ndb.verbose = false;
    });

    describe("for a break event", function() {
      before_each(function() {
        out = "";

        ndb.Helpers.puts = function(t) {
          out += t;
        };
      });

      // {"seq":117,"type":"event","event":"break","body":{"functionName":"f","sourceLine":1,"sourceColumn":14}}

      it("should output a break event", function() {
        var json = '{"seq":117,"type":"event","event":"break","body":{"functionName":"f","sourceLine":0,"sourceColumn":14}}';

        event_listner.receive(SpecHelpers.makeResponse(json));

        out.should.equal("Breakpoint at 1:14 (in function f)");
      });

      it("should buffer the data", function() {
        var json = '{"seq":117,"type":"event","event":"break","bo';
        var json2 = 'dy":{"functionName":"f","sourceLine":0,"sourceColumn":14}}';

        event_listner.receive(SpecHelpers.makeHeader(json + json2) + json);
        event_listner.receive(json2);

        out.should.equal("Breakpoint at 1:14 (in function f)");
      });

      it("should reset the buffer after a successful call", function() {
        var json = '{"seq":117,"type":"event","event":"break","body":{"functionName":"f","sourceLine":0,"sourceColumn":14}}';

        event_listner.receive(SpecHelpers.makeResponse(json));

        event_listner.buffer.should.equal("");
      });

      it("should use the correct source column number", function() {
        var json = '{"seq":117,"type":"event","event":"break","body":{"functionName":"f","sourceLine":0,"sourceColumn":6}}';

        event_listner.receive(SpecHelpers.makeResponse(json));

        out.should.equal("Breakpoint at 1:6 (in function f)");
      });

      it("should use the correct source line number (first line === 0)", function() {
        var json = '{"seq":117,"type":"event","event":"break","body":{"functionName":"f","sourceLine":1,"sourceColumn":14}}';

        event_listner.receive(SpecHelpers.makeResponse(json));

        out.should.equal("Breakpoint at 2:14 (in function f)");
      });

      it("should use the correct function name", function() {
        var json = '{"seq":117,"type":"event","event":"break","body":{"functionName":"foo","sourceLine":0,"sourceColumn":14}}';

        event_listner.receive(SpecHelpers.makeResponse(json));

        out.should.equal("Breakpoint at 1:14 (in function foo)");
      });

      // {"seq":117,"type":"event","event":"break","body":{"functionName":"g","scriptData":"test.js","sourceLine":12,"sourceColumn":22,"breakpoints":[1]}}

      it("should output the filename + breakpoints when given", function() {
        var json = '{"seq":117,"type":"event","event":"break","body":{"functionName":"g","scriptData":"test.js","sourceLine":12,"sourceColumn":22,"breakpoints":[1]}}';

        event_listner.receive(SpecHelpers.makeResponse(json));

        out.should.equal("Breakpoint at test.js:13:22 (in function g - breakpoints: [1])");
      });

      // {"seq":117,"type":"event","event":"break","body":{"functionName":"h","sourceLine":100,"sourceColumn":12,"breakpoints":[3,5,7]}}
      it("should output multiple breakpoints", function() {
        var json = '{"seq":117,"type":"event","event":"break","body":{"functionName":"h","sourceLine":100,"sourceColumn":12,"breakpoints":[3,5,7]}}';

        event_listner.receive(SpecHelpers.makeResponse(json));

        out.should.equal("Breakpoint at 101:12 (in function h - breakpoints: [3,5,7])");
      });

      it("should output the sourceline if one is given", function() {
        var json = '{"seq":117,"type":"event","event":"break","body":{"functionName":"h","sourceLine":100,"sourceColumn":12,"sourceLineText":"foo() {};"}}';

        event_listner.receive(SpecHelpers.makeResponse(json));

        var regex = new RegExp(/foo\(\)\ \{\}\;/);
        out.search(regex).should.not.equal(-1);
      });

      it("should pretty format the code", function() {
        var json = {
          "seq":117,
          "type":"event",
          "event":"break",
          "body": {
            "functionName":"f",
            "sourceLine":0,
            "sourceColumn":14,
            "sourceLineText":"foo() {};"
          }
        };

        event_listner.receive(SpecHelpers.makeResponse(JSON.stringify(json)));

        out.should.equal("Breakpoint at 1:14 (in function f)\nfoo() {};");
      });

      // { "seq"   : <number>,
      //   "type"  : "event",
      //
      //   "event" : "break",
      //   "body"  : { "invocationText" : <text representation of the stack frame>,
      //               "sourceLine"     : <source line where execution is stopped>,
      //               "sourceColumn"   : <column within the source line where execution is stopped>,
      //               "sourceLineText" : <text for the source line where execution is stopped>,
      //               "script"         : { name         : <resource name of the origin of the script>
      //                                    lineOffset   : <line offset within the origin of the script>
      //                                    columnOffset : <column offset within the origin of the script>
      //                                    lineCount    : <number of lines in the script>
      //               "breakpoints"    : <array of break point numbers hit if any>
      //             }
      // }
      //
      // {
      //   "seq":6,
      //   "type":"event",
      //   "event":"break",
      //   "body":{
      //     "invocationText":"#<an Object>.[anonymous](exports=#<an Object>, require=function require(path) {\n return loadModule(path, self);\n }, module=#<a Module>, __filename=/Users/scotttaylor/src/git/ndb/lib/ndb.js, __dirname=/
      //     "sourceLine":5,
      //     "sourceColumn":12,
      //     "sourceLineText":"ndb.version = \"0.0.1\";",
      //     "script":{
      //       "id":18,
      //       "name":"/Users/scotttaylor/src/git/ndb/lib/ndb.js",
      //       "lineOffset":0,
      //       "columnOffset":0,
      //       "lineCount":255
      //     },
      //     "breakpoints":[1]
      //   }
      // }
      it("should store the filename + line number", function() {
        var json = JSON.stringify({
          seq: 1,
          type: "event",
          event: "break",
          body: {
            sourceLine: 30,
            script: {
              name: "foo.js"
            }
          }
        });

        event_listner.receive(SpecHelpers.makeResponse(json));
        ndb.State.filename.should.equal("foo.js");
        ndb.State.lineNumber.should.equal(31);
      });

      it("should set the line number when it is 0 to 1 (we get back lineOffset, but we want to know it's true line number)", function() {
        var json = JSON.stringify({
          seq: 1,
          type: "event",
          event: "break",
          body: {
            sourceLine: 0,
            script: {
              name: "foo.js"
            }
          }
        });

        event_listner.receive(SpecHelpers.makeResponse(json));
        ndb.State.lineNumber.should.equal(1);
      });
    });
  });
});
