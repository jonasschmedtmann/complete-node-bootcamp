describe("ndb", function() {
  describe("Commands", function() {
    describe("repl", function() {
      before_each(function() {
        repl = ndb.Commands.REPL;

        raw_write = ndb.Commands.RawWrite;
        spy.stub(raw_write, "run");
      });

      it("should have the command name 'repl'", function() {
        repl.commandNames[0].should.equal('repl');
      });

      it("should output a prompt + help text", function() {
        spy.spyOn(ndb.Helpers, function() {
          repl.run();

          spy.intercepted(ndb.Helpers, "puts", function(text) {
            text.should.equal("Welcome to the ndb repl.\nType .break to exit.");
          });

          spy.intercepted(ndb.Helpers, "print", function(text) {
            text.should.equal("repl> ");
          });
        });
      });

      it("should have the normal repl off before executing", function() {
        ndb.State.replOn.should.equal(false);
      });

      it("should turn on the main repl when executing", function() {
        repl.run(function(){
          ndb.State.replOn.should.equal(true);
        });
      });
    });

    describe("running the repl", function() {
      before_each(function() {
        repl = ndb.Commands.REPL;

        raw_write = ndb.Commands.RawWrite;
        spy.stub(raw_write, "run");
      });

      it("should evaluate a command", function() {
        spy.spyOn(raw_write, function() {
          repl.execute("1+1");

          spy.intercepted(raw_write, "run", function(args) {
            args.type.should.equal("request");
            args.command.should.equal("evaluate");
            args.arguments.expression.should.equal("1+1");
          });
        });
      });

      it("should evaluate the correct command", function() {
        spy.spyOn(raw_write, function() {
          repl.execute("foo");

          spy.intercepted(raw_write, "run", function(args) {
            args.arguments.expression.should.equal("foo");
          });
        });
      });

      it("should loop until a break is given - (it should not raw write the command)", function() {
        raw_write.run = function() {
          false.should.equal(true);
        };

        repl.execute(".break");
        true.should.equal(true);
      });

      it("should return false when the str == .break", function() {
        repl.execute(".break").should.equal(false);
      });

      it("should return false when the str === '.break\n'", function() {
        repl.execute(".break\n").should.equal(false);
      });

      it("should return true when the str != '.break'", function() {
        repl.execute("foo").should.equal(true);
      });
    });
  });
});
