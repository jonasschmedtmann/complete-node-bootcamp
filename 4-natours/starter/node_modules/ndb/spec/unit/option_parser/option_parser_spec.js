describe("Option Parsing", function() {
  describe("opts", function() {
    it("should have opts as the option parser", function() {
      var optionParser = ndb.OptionParser.opts;
      optionParser["parse"].should.not.be_null;
    });
  });

  describe("parsing and running", function() {
    it("should parse the options", function() {
      var option_parser = ndb.OptionParser;
      var internalOptParseLibrary = option_parser.opts;

      spy.stub(internalOptParseLibrary, "parse");

      spy.spyOn(internalOptParseLibrary, function() {
        option_parser.parse();

        spy.intercepted(internalOptParseLibrary, "parse", function(options, arguments, auto_generated_help) {
          options.should.equal(option_parser.options);
          arguments.length.should == 0;
          auto_generated_help.should.equal(true);
        });
      });
    });

    it("should call ndb.start()", function() {
      spy.spyOn(ndb, function() {
        ndb.OptionParser.parse();
        spy.intercepted(ndb, "start");
      });
    });
  });

  describe("version", function() {
    before_each(function() {
      spy.stub(ndb.Helpers, "exit");

      findShortOption = function(option_name) {
        var result = null;

        ndb.OptionParser.options.forEach(function(option) {
          if (option["short"] === option_name) {
            result = option;
          }
        });

        return result;
      };

      findLongOption = function(option_name) {
        var result = null;

        ndb.OptionParser.options.forEach(function(option) {
          if (option["long"] === option_name) {
            result = option;
          }
        });

        return result;
      };
    });

    describe("version", function() {
      it("should parse -v as version", function() {
        findShortOption("v").should.not.be_null;
      });

      it("should parse --version", function() {
        findLongOption("version").should.not.be_null;
      });

      it("should have a description", function() {
        findLongOption("version").description.should.equal("Print version and exit");
      });

      it("should print out the current version", function() {
        spy.spyOn(ndb.Helpers, function() {
          findLongOption("version").callback();

          spy.intercepted(ndb.Helpers, "puts", function(text) {
            text.should.equal("ndb version 0.2.4");
          });
        });
      });

      it("should exit after running", function() {
        spy.spyOn(ndb.Helpers, function() {
          findLongOption("version").callback();

          spy.intercepted(ndb.Helpers, "exit");
        });
      });
    });

    describe("port", function() {
      it("should parse -p as port", function() {
        findShortOption("p").should.not.be_null;
      });

      it("should parse --port", function() {
        findLongOption("port").should.not.be_null;
      });

      it("should have a description", function() {
        findLongOption("port").description.should.equal("Set the port (default: 5858)");
      });

      it("should take a value", function() {
        findLongOption("port").value.should.be(true);
      });

      it("should set the value when given", function() {
        findLongOption("port").callback(1000);
        ndb.port.should.equal(1000);
      });

      it("should convert the arg to an int", function() {
        findLongOption("port").callback("1000");
        ndb.port.should.equal(1000);
      });
    });

    describe("host", function() {
      it("should parse -h as host", function() {
        findShortOption("h").should.not.be_null;
      });

      it("should parse --host", function() {
        findLongOption("host").should.not.be_null;
      });

      it("should have a description", function() {
        findLongOption("host").description.should.equal("Set the host (default: 127.0.0.1)");
      });

      it("should take a value", function() {
        findLongOption("host").value.should.be(true);
      });

      it("should set the value when given", function() {
        findLongOption("host").callback("example.com");
        ndb.host.should.equal("example.com");
      });
    });

    describe("local", function() {
      before_each(function() {
        childProcess = ndb.Helpers.childProcess;
        spy.stub(childProcess, "spawn");
        spy.stub(ndb.Helpers, "puts");
      });

      it("should have ndb.Helpers.childProcess as child_process provided by node", function() {
        ndb.Helpers.childProcess.should.equal(require("child_process"));
      });

      it("should parse -l as local", function() {
        findShortOption("l").should.not.be_null;
      });

      it("should parse --local", function() {
        findLongOption("local").should.not.be_null;
      });

      it("should have a description", function() {
        findLongOption("local").description.should.equal("Shortcut for running $(node --debug-brk <myscript> &; ndb) locally.");
      });

      it("should require a value", function() {
        findLongOption("local").value.should.be(true);
      });

      it("should shell out to start the script", function() {
        spy.spyOn(childProcess, function() {
          findLongOption("local").callback("tmp.js");

          spy.intercepted(childProcess, "spawn", function(name, args) {
            name.should.equal("node");
            args[0].should.equal("--debug-brk");
            args[1].should.equal("tmp.js");
          });
        });
      });

      it("should use the correct script name when shelling out", function() {
        spy.spyOn(childProcess, function() {
          findLongOption("local").callback("foobar.js");

          spy.intercepted(childProcess, "spawn", function(name, args) {
            name.should.equal("node");
            args[0].should.equal("--debug-brk");
            args[1].should.equal("foobar.js");
          });
        });
      });

      it("should display the shell command to STDOUT", function() {
        spy.spyOn(ndb.Helpers, function() {
          findLongOption("local").callback("tmp.js");

          spy.intercepted(ndb.Helpers, "puts", function(text) {
            text.should.equal("Spawning process: `node --debug-brk tmp.js`");
          });
        });
      });
    });

    describe("verbose", function() {
      it("should parse --verbose", function() {
        findLongOption("verbose").should.not.be_null;
      });

      it("should have a description", function() {
        findLongOption("verbose").description.should.equal("Turn on verbose/debugging mode (default: off)");
      });

      it("should turn on verbosity", function() {
        findLongOption("verbose").callback();
        ndb.verbose.should.be(true);
      });
    });
  });
});
