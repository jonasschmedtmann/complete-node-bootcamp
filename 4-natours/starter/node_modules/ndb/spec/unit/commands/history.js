describe("NodeDebugger", function() {
  describe("Commands", function() {
    describe("history", function() {
      before_each(function() {
        history = ndb.Commands.History;

        puts_called_with = [];
        spy.stub(ndb.Helpers, "puts", function(text) {
          puts_called_with.push(text);
        });

        prompt_called = false;
        spy.stub(ndb.Helpers, "prompt", function() {
          prompt_called = true;
        });
      });

      it("should output the command history - one for one line", function() {
        ndb.State.history = ["list"];
        history.run();
        puts_called_with[0].should.equal("    1  list");
      });

      it("should output several commands, numbering them appropriately", function() {
        ndb.State.history = ["list", "foo"];
        history.run();
        puts_called_with[0].should.equal("    1  list");
        puts_called_with[1].should.equal("    2  foo");
      });

      it("should pad the numbers appropriately", function() {
        ndb.State.history = [
          "one",
          "two",
          "three",
          "four",
          "five",
          "six",
          "seven",
          "eight",
          "nine",
          "ten"
        ];

        history.run();
        puts_called_with[8].should.equal("    9  nine");
        puts_called_with[9].should.equal("   10  ten");
      });

      it("should output the prompt", function() {
        history.run();
        prompt_called.should.be(true);
      });
    });
  });
});
