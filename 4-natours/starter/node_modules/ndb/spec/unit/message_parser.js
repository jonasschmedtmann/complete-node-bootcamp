describe("Node Debugger", function() {
  describe("message parser", function() {
    before_each(function() {
      parser = ndb.MessageParser;
    });

    it("should disregard an invalid header", function() {
      var str = "A-Header\r\n\r\n";
      var obj = parser.parse(str);

      obj.headers["A-Header"].should.be(undefined);
    });

    describe("parsing an appropriate message", function() {
      it("should have a message header, raw_header, and body", function() {
        var message = "A-Header: 1\r\n\r\n",
            parsed_message;

        parsed_message = parser.parse(message);
        parsed_message.raw_headers.should.equal("A-Header: 1\r\n");
        parsed_message.headers.should.not.equal(null);
        parsed_message.body.should.not.equal(null);
      });

      it("should parse the body as after the empty line", function() {
        var message = "A-Header: 1\r\n\r\n",
            parsed_message;

        parsed_message = parser.parse(message);
        parsed_message.body.should.equal("");
      });

      it("should parse the correct body text", function() {
        var message = "A-Header: 1\r\n\r\nfoo",
            parsed_message;

        parsed_message = parser.parse(message);
        parsed_message.body.should.equal("foo");
      });

      it("should parse a header into it's components", function() {
        var message = "A-Header: 1\r\n\r\n",
            parsed_message;

        parsed_message = parser.parse(message);
        parsed_message.headers["A-Header"].should.equal("1");
      });

      it("should parse a different header", function() {
        var message = "Foo: 1\r\n\r\n\n",
            parsed_message;

        parsed_message = parser.parse(message);
        parsed_message.headers["Foo"].should.equal("1");
      });

      it("should parse a header value appropriately", function() {
        var message = "Foo: 2\r\n\r\n\n",
            parsed_message;

        parsed_message = parser.parse(message);
        parsed_message.headers["Foo"].should.equal("2");
      });

      it("should parse a header value appropriately where the value has a colon in it", function() {
        var message = "Foo: 2: 1",
            parsed_message;

        parsed_message = parser.parse(message);
        parsed_message.headers["Foo"].should.equal("2: 1");
      });

      it("should not trim text to the right of the variable", function() {
        var message = "Foo: 2: 1           ",
            parsed_message;

        parsed_message = parser.parse(message);
        parsed_message.headers["Foo"].should.equal("2: 1           ");
      });

      it("should allow no whitespace between the variable + value in the header", function() {
        var message = "Foo:2\r\n\r\n\n",
            parsed_message;

        parsed_message = parser.parse(message);
        parsed_message.headers["Foo"].should.equal("2");
      });

      it("should allow multiple headers", function() {
        var message = "Foo:1\r\nBar:2\r\n\r\n\n",
            parsed_message;

        parsed_message = parser.parse(message);
        parsed_message.headers["Foo"].should.equal("1");
        parsed_message.headers["Bar"].should.equal("2");
      });
    });
  });
});
