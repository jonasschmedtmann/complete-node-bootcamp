describe("NodeDebugger", function() {
  describe("Commands", function() {
    describe("next", function() {
      before_each(function() {
        next = ndb.Commands.Next;
      });

      describe("parsing", function() {
        it("should parse 'n' as next", function() {
          next.parseCommand("n")[0].should.equal(next);
        });

        it("should be a parse failure with random text", function() {
          next.parseCommand("adsfadsf").should.be(undefined);
        });

        it("should parse 'next' as next", function() {
          next.parseCommand("next")[0].should.equal(next);
        });

        it("should not have a second argument if not given one", function() {
          // var result = next.parseCommand("next");
          // result.length.should.equal(1);
        });

        it("should parse n 10 as [next, 10]", function() {
          var result = next.parseCommand("n 10");
          result[0].should.equal(next);
          result[1].should.equal("10");
        });

        it("should use the correct arguments when parsing", function() {
          var result = next.parseCommand("n 2");
          result[0].should.equal(next);
          result[1].should.equal("2");
        });
      });

      // {"seq":117,"type":"request","command":"continue"}
      // {"seq":118,"type":"request","command":"continue","arguments":{"stepaction":"out"}}
      // {"seq":119,"type":"request","command":"continue","arguments":{"stepaction":"next","stepcount":5}}
      describe("running", function() {
        before_each(function() {
          raw_write = ndb.Commands.RawWrite;
          spy.stub(raw_write, "run");
        });

        it("should raw write", function() {
          spy.spyOn(raw_write, function() {
            next.run();
            spy.intercepted(raw_write, "run").should.be(true);
          });
        });

        it("should raw write with the stepaction next when given no args", function() {
          spy.spyOn(raw_write, function() {
            next.run();

            spy.intercepted(raw_write, "run", function(obj) {
              obj.type.should.equal("request");
              obj.command.should.equal("continue");
              obj.arguments.stepaction.should.equal("next");
              obj.arguments.stepcount.should.equal(1);
            });
          });
        });

        it("should use the stepcount", function() {
          spy.spyOn(raw_write, function() {
            next.run(1);

            spy.intercepted(raw_write, "run", function(obj) {
              obj.arguments.stepaction.should.equal("next");
              obj.arguments.stepcount.should.equal(1);
            });
          });
        });

        it("should use the correct stepcount", function() {
          spy.spyOn(raw_write, function() {
            next.run(2);

            spy.intercepted(raw_write, "run", function(obj) {
              obj.arguments.stepaction.should.equal("next");
              obj.arguments.stepcount.should.equal(2);
            });
          });
        });
      });
    });
  });
});
