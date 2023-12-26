describe("Espionage", function() {
  it("should be at version 0.2.0", function() {
    Espionage.version.should.equal("0.2.0");
  });

  describe("stub", function() {
    it("should be the same as Espionage.Stubber.stub", function() {
      Espionage.stub.should.equal(Espionage.Stub.stub);
    });
  });

  describe("spyOn", function() {
    it("should be the same as Espionage.Spy.spyOn", function() {
      Espionage.spyOn.should.equal(Espionage.Spy.spyOn);
    });
  });
});
