describe("NodeDebugger", function() {
  describe("Commands", function() {
    describe("version", function() {
      before_each(function() {
        version = ndb.Commands.Version;

        puts_called_with = [];
        spy.stub(ndb.Helpers, "puts", function(text) {
          puts_called_with.push(text);
        });

        prompt_called = false;
        spy.stub(ndb.Helpers, "prompt", function() {
          prompt_called = true;
        });
      });

      it("should output the ndb + node version", function() {
        version.run();
        puts_called_with[0].should.equal("ndb:          version 0.2.4");
        puts_called_with[1].should.equal("node (local): version " + process.version);
      });

      it("should output the prompt", function() {
        version.run();
        prompt_called.should.be(true);
      });

      it("should parse 'version' as the version", function() {
        version.parseCommand("version")[0].should.equal(version);
      });

      it("should not parse 'foo'", function() {
        version.parseCommand("foo").should.equal(undefined);
      });
    });

    describe("package.json version", function() {
      it("should have the correct version", function() {
        var file_contents = require("fs").readFileSync("./package.json", 'ascii');
        var data = JSON.parse(file_contents);

        data["version"].should.equal("0.2.4");
      });
    });
  });
});
