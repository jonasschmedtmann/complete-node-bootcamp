describe('NodeDebugger', function() {
  describe('State', function() {
    it("should have the filename as null", function() {
      ndb.State.filename.should.equal(null);
    });

    it("should have the line number as null", function() {
      ndb.State.lineNumber.should.equal(null);
    });

    it("should reset properly", function() {
      ndb.State.filename = "foo.js";
      ndb.State.lineNumber = 10;

      ndb.reset();

      ndb.State.filename.should.equal(null);
      ndb.State.lineNumber.should.equal(null);
    });
  });
});
