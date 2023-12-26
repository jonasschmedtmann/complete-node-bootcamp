describe("NodeDebugger", function() {
  describe("Commands", function() {
    describe("help", function() {
      before_each(function() {
        connection = {
          write: function() {}
        };

        commands = ndb.Commands;
        commands.connection = connection;

        help = commands.Help;
      });

      it("should output all of the command names", function() {
        var text = "";

        spy.stub(ndb.Helpers, "puts", function(t) {
          text += t;
        });

        help.run();
        text.should.match(/b\, break/);
        text.should.match(/l\, list/);
      });

      it("should sort the commands", function() {
        var text = "";

        spy.stub(ndb.Helpers, "puts", function(t) {
          text += t;
        });

        help.run();
        text.replace(/\n/g, "").should.match(/break.+list/);
      });
    });
  });
});
