JSpecDotReporter = function(results, options) {
  var color = JSpec.color,
      sys   = require("sys"),
      print = sys.print,
      puts  = sys.puts,
      failure_specs = [];

  results.allSuites.forEach(function(suite) {
    if (suite.hasSpecs()) {
      suite.specs.forEach(function(spec) {
        if (spec.requiresImplementation()) {
          print(color('P', 'blue'));
        } else if (spec.passed()) {
          print(color('.', 'green'));
        } else if (!spec.passed()) {
          print(color('F', 'red'));
          failure_specs.push(spec);
        }
      });
    }
  });

  puts("");

  failure_specs.forEach(function(spec) {
     var assertionsGraph = JSpec.inject(spec.assertions, '', function(graph, assertion){
       return graph + color('.', assertion.passed ? 'green' : 'red');
     });

    var failure_message = function(failure) {
      var messages = failure.failures().map(function(s) {
        return s.message;
      });

      return(messages.join("\n"));
    };

    puts("");
    puts(color("FAILURE:", "red"));
    puts(color(spec.description, 'bold'));
    puts(failure_message(spec)  + assertionsGraph);
  });

  puts("");

  puts(color(" Passes: ", 'bold') + color(results.stats.passes, 'green'));
  puts(color(" Failures: ", 'bold') + color(results.stats.failures, 'red'));
  puts(color(" Duration: ", 'bold') + color(results.duration, 'green') + " ms");

  puts("");
};