describe("Spy", function() {
  before_each(function() {
    obj = {};
  });

  describe("spyOn", function() {
    it("should call the function given to spyOn", function() {
      var called = false;
      obj.foo = function() { called = true; };

      spy.spyOn(obj, function() {
        obj.foo();
      });

      expect(called).to(equal, true);
    });

    it("should throw a Espionage.MockExpectionError when receiving a message", function() {
      spy.spyOn(obj, function() {
        try {
          spy.intercepted(obj, "foo");
        } catch (e) {
          e.name.should.equal("MockExpectationError");
          e.message.should.equal("expected foo but never got it");
        }
      });
    });

    it("should use the correct function name", function() {
      spy.spyOn(obj, function() {
        try {
          spy.intercepted(obj, "bar");
        } catch (e) {
          e.name.should.equal("MockExpectationError");
          e.message.should.equal("expected bar but never got it");
        }
      });
    });

    it("should report true when receiving a message", function() {
      spy.stub(obj, "foo");

      spy.spyOn(obj, function() {
        obj.foo();
        expect(spy.intercepted(obj, "foo")).to(be_true);
      });
    });

    it("should be able to reset the intercepted status", function() {
      spy.stub(obj, "foo");

      spy.spyOn(obj, function() {
        obj.foo();
      });

      spy.Spy.tearDown(obj);

      spy.spyOn(obj, function() {
        try {
          spy.intercepted(obj, "foo");
        } catch (e) {
          e.message.should.equal("expected foo but never got it");
          e.name.should.equal("MockExpectationError");
        }
      });
    });

    it("should report a positive message expectation on a different method", function() {
      stubber.stub(obj, "bar");

      spy.spyOn(obj, function() {
        obj.bar();
        expect(spy.intercepted(obj, "bar")).to(be_true);
      });
    });

    it("should not redefine a property which is not a method", function() {
      obj.bar = 7;

      spy.spyOn(obj, function() {
        expect(obj.bar).to(equal, 7);
      });
    });

    it("should raise an error", function() {
      spy.stub(obj, "foo");

      spy.spyOn(obj, function() {
        obj.foo();

        try {
          spy.intercepted(obj, "bar");
        } catch (e) {
          e.name.should.equal("MockExpectationError");
        }
      });
    });

    it("should raise an error for a method which is not defined", function() {
      spy.spyOn(obj, function() {
        try {
          spy.intercepted(obj, "baz");
        } catch (e) {
          e.name.should.equal("MockExpectationError");
        }
      });
    });

    it("should be true when called indirectly", function() {
      stubber.stub(obj, "bar");

      var other_obj = {
        foo: function(obj) {
          obj.bar();
        }
      };

      spy.spyOn(obj, function() {
        other_obj.foo(obj);
        expect(spy.intercepted(obj, "bar")).to(be_true);
      });
    });

    it("should not add an function onto the object executing", function() {
      var obj = {};

      spy.spyOn(obj, function() {
        obj.hasOwnProperty("intercepted").should.be(false);
      });
    });

    describe("with arguments", function() {
      it("should yield the arguments given to the third param / block", function() {
        var obj = {};
        spy.stub(obj, "foo");

        spy.spyOn(obj, function() {
          obj.foo();

          spy.intercepted(obj, "foo", function() {
            arguments.length.should.equal(0);
          });
        });
      });

      it("should yield the correct args", function() {
        var obj = {};
        spy.stub(obj, "foo");

        spy.spyOn(obj, function() {
          obj.foo("one", "two");

          spy.intercepted(obj, "foo", function() {
            arguments.length.should.equal(2);
            arguments[0].should.equal("one");
            arguments[1].should.equal("two");
          });
        });
      });

      it("should raise a mock expectation error if the fun is never called", function() {
        var obj = {};
        spy.stub(obj, "foo");

        try {
          spy.spyOn(obj, function() {
            spy.intercepted(obj, "foo", function(args) {
            });
          });
        } catch (e) {
          e.name.should.equal("MockExpectationError");
        }
      });

      it("should yield to the function multiple times when called multiple times", function() {
        var obj = {};
        spy.stub(obj, "foo");

        var arg_pairs = [];

        spy.spyOn(obj, function() {
          obj.foo("one");
          obj.foo("two");

          spy.intercepted(obj, "foo", function() {
            arguments.length.should.equal(1);
            arg_pairs.push(arguments);
          });
        });

        arg_pairs[0][0].should.equal("one");
        arg_pairs[1][0].should.equal("two");
      });
    });
  });
});
