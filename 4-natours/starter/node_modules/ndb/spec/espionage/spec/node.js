require.paths.unshift('spec', '/Users/scotttaylor/.rvm/gems/ruby/1.8.6/gems/jspec-3.3.2/lib', 'lib');
require('jspec');

require.paths.unshift("./../lib");

require("espionage");

spy = Espionage;
stubber = spy.Stub;

JSpec.include({
  beforeSpec: function() {
    spy.tearDown();
  }
});

JSpec.
  exec('spec/espionage/helpers_spec.js').
  exec('spec/espionage/spy_spec.js').
  exec('spec/espionage/stub_spec.js').
  exec('spec/espionage/espionage_spec.js').
  exec('spec/espionage/global_spec.js').
  run({ reporter: JSpec.reporters.Terminal, fixturePath: 'spec/fixtures' }).
  report();
