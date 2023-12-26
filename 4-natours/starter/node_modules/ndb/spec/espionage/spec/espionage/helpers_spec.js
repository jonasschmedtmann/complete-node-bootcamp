describe("Helpers", function() {
  before_each(function() {
    helper_prototype = Espionage.Helpers;
    helper = helper_prototype.clone(helper_prototype);
  });

  describe("object", function() {
    it("should return an object with it's prototype as the constructor", function() {
      var obj = {};
      var cloned_object = helper.clone(obj);

      cloned_object.__proto__.should.equal(obj);
    });

    it("should return an object which is not equal (it should not be the same object)", function() {
      var obj = {};
      expect(helper.clone(obj) == obj).to(be_false);
    });
  });

  describe("hasProperty", function() {
    it("should be true for an object which has defined the property", function() {
      var obj = {};
      obj.foo = "bar";

      helper.hasProperty(obj, "foo").should.be(true);
    });

    it("should be false for an object which hasn't", function() {
      var obj = {};

      helper.hasProperty(obj, "foo").should.be(false);
    });

    it("should be true for an object which has defined it, but it is set to undefined", function() {
      var obj = {};
      obj.foo = undefined;

      helper.hasProperty(obj, "foo").should.be(true);
    });

    it("should be true for an object which has inherited the property", function() {
      var prototype = {
        foo: "bar"
      };

      clone = helper.clone(prototype);

      helper.hasProperty(clone, "foo").should.be(true);
    });
  });
});
