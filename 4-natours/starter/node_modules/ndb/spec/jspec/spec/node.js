
require.paths.unshift('./lib', './spec');

require("jspec")
require("jspec.nodejs")
require("unit/helpers")

JSpec
.exec('spec/unit/spec.js')
.exec('spec/unit/spec.node.js')
.exec('spec/unit/spec.utils.js')
.exec('spec/unit/spec.modules.js')
.exec('spec/unit/spec.matchers.js')
.exec('spec/unit/spec.shared-behaviors.js')
.exec('spec/unit/spec.grammar.js')
.exec('spec/unit/spec.grammar-less.js')
.exec('spec/unit/spec.fixtures.js')
.run({ reporter: JSpec.reporters.Terminal, failuresOnly: true, fixturePath: 'spec/fixtures' })
.report()