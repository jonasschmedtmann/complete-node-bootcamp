require.paths.unshift("./lib/");

require("./jspec_dot_reporter/jspec_dot_reporter");
require("./espionage/lib/espionage");
require("./underscore/underscore");
require('./jspec/lib/jspec');
require('./unit/spec.helper');


spy = Espionage;

JSpec.include({
  beforeSpec: function() {
    spy.tearDown();
  },

  afterSpec: function() {
    spy.tearDown();
  }
});

JSpec.
  exec("spec/unit/node_spec.js").
  exec('spec/unit/spec.js').
  exec('spec/unit/ndb.js').
  exec('spec/unit/command_center.js').
  exec('spec/unit/event_listener.js').
  exec('spec/unit/event_listeners/break.js').
  exec('spec/unit/event_listeners/source.js').
  exec('spec/unit/commands/raw_write.js').
  exec('spec/unit/commands/help.js').
  exec('spec/unit/commands/list.js').
  exec('spec/unit/commands/continue.js').
  exec('spec/unit/commands/step_in.js').
  exec('spec/unit/commands/step_out.js').
  exec('spec/unit/commands/setbreakpoint.js').
  exec('spec/unit/commands/quit.js').
  exec('spec/unit/commands/version.js').
  exec('spec/unit/commands/evaluate.js').
  exec('spec/unit/commands/next.js').
  exec('spec/unit/commands/verbose.js').
  exec('spec/unit/commands/backtrace.js').
  exec('spec/unit/commands/history.js').
  exec('spec/unit/commands/repl.js').  
  exec('spec/unit/message_parser.js').
  exec('spec/unit/state.js').
  exec('spec/unit/option_parser/option_parser_spec.js').
  run({ reporter: JSpecDotReporter, fixturePath: 'spec/fixtures' }).
  report();
