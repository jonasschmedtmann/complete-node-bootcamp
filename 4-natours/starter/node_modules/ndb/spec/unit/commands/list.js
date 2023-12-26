describe("NodeDebugger", function() {
  describe("Commands", function() {
    describe("List", function() {
      before_each(function() {
        connection = {
          write: function() {}
        };

        commands = ndb.Commands;
        commands.connection = connection;

        list = commands.List;

        writer = ndb.Commands.RawWrite;
      });

      it("should raw write the json", function() {
        var obj = undefined;

        ndb.Commands.RawWrite = {
          run: function(o) {
            obj = o;
          }
        };

        var expected_object = {
          type:    "request",
          command: "source",
          arguments: {
            "fromLine": 0,
            "toLine":   5
          }
        };

        list.run();

        JSON.stringify(obj).should.equal(JSON.stringify(expected_object));
      });

      it("should use the line number from the break event", function() {
        ndb.State.lineNumber = 10;

        spy.spyOn(writer, function() {
          list.run();

          spy.intercepted(writer, "run", function(obj) {
            obj["arguments"].fromLine.should.equal(7);
            obj["arguments"].toLine.should.equal(12);
          });
        });
      });

      describe("context", function() {
        it("should have the default of 2", function() {
          list.reset();
          list.context.should.equal(4);
        });
      });

      describe("calculating the context", function() {
        it("should return -2, +2", function() {
          var context = list.calculateContext(10);
          context.posterior.should.equal(8);
          context.anterior.should.equal(12);
        });

        it("should use the correct numbers", function() {
          var context = list.calculateContext(20);
          context.posterior.should.equal(18);
          context.anterior.should.equal(22);
        });

        it("should calculate based on the value of the context variable", function() {
          list.context = 3;

          var context = list.calculateContext(10);
          context.posterior.should.equal(7);
          context.anterior.should.equal(13);
        });

        it("should never go below 1", function() {
          var context = list.calculateContext(1);
          context.posterior.should.equal(1);
        });

        it("should change the second value to account for the first going below 1", function() {
          list.context.should.equal(2);

          var context = list.calculateContext(1);
          context.posterior.should.equal(1);
          context.anterior.should.equal(5);
        });
      });
    });
  });
});
