describe("NodeDebugger", function() {
  describe("Commands", function() {
    describe("quitting", function() {
      before_each(function() {
        original_exit = process.quit;
        exit_called = false;
        process.exit = function() {
          exit_called = true;
        };

        original_puts = ndb.Helpers.puts;
        puts_called_with = undefined;
        ndb.Helpers.puts = function(text) {
          puts_called_with = text;
        };

        quitter = ndb.Commands.Quit;
      });

      after_each(function() {
        process.exit = original_exit;
        ndb.Helpers.puts = original_puts;
      });

      it("should quit", function() {
        quitter.run();
        exit_called.should.be(true);
      });

      it("should output a message", function() {
        quitter.run();
        puts_called_with.should.equal("bye!");
      });

      it("should parse 'quit' as quit", function() {
        quitter.parseCommand("quit")[0].should.equal(quitter);
      });

      it("should parse 'exit' as quit", function() {
        quitter.parseCommand("exit")[0].should.equal(quitter);
      });
    });
  });
});
