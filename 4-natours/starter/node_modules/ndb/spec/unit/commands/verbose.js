describe("NodeDebugger", function() {
  describe("Commands", function() {
    describe("verbose", function() {
      before_each(function() {
        verbose = ndb.Commands.Verbose;
        node_debugger = verbose.ndb;
      });

      describe("parsing", function() {
        it("should parse 'verbose'", function() {
          verbose.parseCommand("verbose")[0].should.equal(verbose);
        });

        it("should not parse a random string", function() {
          verbose.parseCommand("asdfasdfa").should.be(undefined);
        });
      });

      describe("running", function() {
        before_each(function() {
          spy.stub(node_debugger.Helpers, "puts");
        });

        it("should turn off the verbose flag if on", function() {
          node_debugger.verbose = true;
          verbose.run();
          node_debugger.verbose.should.be(false);
        });

        it("should turn on the verbose flag if off", function() {
          node_debugger.verbose = false;
          verbose.run();
          node_debugger.verbose.should.be(true);
        });

        it("should output it's new status (as off when toggled off)", function() {
          spy.spyOn(node_debugger.Helpers, function() {
            node_debugger.verbose = true;
            verbose.run();

            spy.intercepted(node_debugger.Helpers, "puts", function(text) {
              text.should.equal("verbose mode now off");
            });
          });
        });

        it("should output it's new status (as on when toggled on)", function() {
          spy.spyOn(node_debugger.Helpers, function() {
            node_debugger.verbose = false;
            verbose.run();

            spy.intercepted(node_debugger.Helpers, "puts", function(text) {
              text.should.equal("verbose mode now on");
            });
          });
        });

        it("should display the prompt when done", function() {
          spy.spyOn(node_debugger.Helpers, function() {
            verbose.run();
            spy.intercepted(node_debugger.Helpers, "prompt").should.be(true);
          });
        });
      });
    });
  });
});