describe("NodeDebugger", function() {
  describe("EventListener", function() {
    before_each(function() {
      event_listner = ndb.EventListener;
      ndb.verbose = false;
      header = "Content-Length: 1\r\n\r\n";
    });

    describe("for a source event", function() {
      before_each(function() {
        event_listner.verbose = false;

        out = "";

        ndb.Helpers.puts = function(t) {
          out += t;
        };

        source = "";
        source += "function() {\n";
        source += "  a += 1;\n";
        source += "  b += 2;\n";
        source += "}\n";

        obj = {
          "seq":      2,
          "type":     "response",
          "command":  "source",
          "success":  true,
          "body": {
            "source":       source,
            "fromLine":     0,
            "toLine":       4,
            "fromPosition": 0,
            "toPosition":   88,
            "totalLines":   4
          },
          "refs": [],
          "running": false
        };
      });

      // { "seq"         : <number>,
      //   "type"        : "response",
      //   "request_seq" : <number>,
      //   "command"     : "source",
      //   "body"        : { "source"       : <the source code>
      //                     "fromLine"     : <actual from line within the script>
      //                     "toLine"       : <actual to line within the script this line is not included in the source>
      //                     "fromPosition" : <actual start position within the script>
      //                     "toPosition"   : <actual end position within the script>
      //                     "totalLines"   : <total lines in the script>
      //                 }
      //   "running"     : <is the VM running after sending this response>
      //   "success"     : true
      // }

      it("should output the source code", function() {
        var lines = obj.body.source.split("\n");

        var expected_output = "";
        expected_output += "   1 " + lines[0] + "\n";
        expected_output += "   2 " + lines[1] + "\n";
        expected_output += "   3 " + lines[2] + "\n";
        expected_output += "   4 " + lines[3];

        event_listner.receive(SpecHelpers.makeResponse(JSON.stringify(obj)));

        out.should.equal(expected_output);
      });

      it("should output when the content-length header is included", function() {
        event_listner.receive(SpecHelpers.makeResponse(JSON.stringify(obj)));

        (/function\(\) \{/).test(out).should.be(true);
      });

      it("should ignore all headers", function() {
        var content = JSON.stringify(obj);
        var headers = "Content-Length: " + content.length + "\r\nFoo: bar\r\n\r\n";

        event_listner.receive(headers + content);

        (/function\(\) \{/).test(out).should.be(true);
      });

      it("should display an arrow next to the current breakpoint line", function() {
        var lines = obj.body.source.split("\n");

        ndb.State.lineNumber = 3;

        var expected_output = "";
        expected_output += "   1 " + lines[0] + "\n";
        expected_output += "   2 " + lines[1] + "\n";
        expected_output += "=> 3 " + lines[2] + "\n";
        expected_output += "   4 " + lines[3];

        event_listner.receive(SpecHelpers.makeResponse(JSON.stringify(obj)));

        out.should.equal(expected_output);
      });

      it("should not display empty undefined lines", function() {
        obj.body.fromLine = 9;
        obj.body.toLine   = 13;

        var lines = obj.body.source.split("\n");

        var expected_output = "";
        expected_output += "   10 " + lines[0] + "\n";
        expected_output += "   11 " + lines[1] + "\n";
        expected_output += "   12 " + lines[2] + "\n";
        expected_output += "   13 " + lines[3];

        event_listner.receive(SpecHelpers.makeResponse(JSON.stringify(obj)));

        out.should.equal(expected_output);
      });
    });
  });
});
