
require.paths.unshift('spec', 'JSPEC_ROOT/lib', 'lib')
require('jspec')
require('unit/spec.helper')
yourlib = require('yourlib')

JSpec
  .exec('spec/unit/spec.js')
  .run({ reporter: JSpec.reporters.Terminal, fixturePath: 'spec/fixtures', failuresOnly: true })
  .report()
