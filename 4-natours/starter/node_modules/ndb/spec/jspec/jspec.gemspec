# -*- encoding: utf-8 -*-

Gem::Specification.new do |s|
  s.name = %q{jspec}
  s.version = "4.3.2"

  s.required_rubygems_version = Gem::Requirement.new(">= 1.2") if s.respond_to? :required_rubygems_version=
  s.authors = ["TJ Holowaychuk"]
  s.date = %q{2010-05-30}
  s.default_executable = %q{jspec}
  s.description = %q{JavaScript BDD Testing Framework}
  s.email = %q{tj@vision-media.ca}
  s.executables = ["jspec"]
  s.extra_rdoc_files = ["README.md", "bin/jspec", "lib/images/bg.png", "lib/images/hr.png", "lib/images/loading.gif", "lib/images/sprites.bg.png", "lib/images/sprites.png", "lib/images/vr.png", "lib/jspec.css", "lib/jspec.growl.js", "lib/jspec.jquery.js", "lib/jspec.js", "lib/jspec.nodejs.js", "lib/jspec.shell.js", "lib/jspec.timers.js", "lib/jspec.xhr.js"]
  s.files = ["History.md", "Manifest", "README.md", "Rakefile", "bin/jspec", "jspec.gemspec", "lib/images/bg.png", "lib/images/hr.png", "lib/images/loading.gif", "lib/images/sprites.bg.png", "lib/images/sprites.png", "lib/images/vr.png", "lib/jspec.css", "lib/jspec.growl.js", "lib/jspec.jquery.js", "lib/jspec.js", "lib/jspec.nodejs.js", "lib/jspec.shell.js", "lib/jspec.timers.js", "lib/jspec.xhr.js", "spec/commands/example_command.rb", "spec/dom.html", "spec/fixtures/test.html", "spec/fixtures/test.json", "spec/fixtures/test.xml", "spec/node.js", "spec/rhino.js", "spec/ruby/bin/init_spec.rb", "spec/ruby/bin/install_spec.rb", "spec/ruby/bin/run_spec.rb", "spec/ruby/bin/shell_spec.rb", "spec/ruby/bin/spec_helper.rb", "spec/ruby/bin/update_spec.rb", "spec/server.html", "spec/server.rb", "spec/support/env.js", "spec/support/jquery.js", "spec/unit/helpers.js", "spec/unit/spec.fixtures.js", "spec/unit/spec.grammar-less.js", "spec/unit/spec.grammar.js", "spec/unit/spec.jquery.js", "spec/unit/spec.jquery.xhr.js", "spec/unit/spec.js", "spec/unit/spec.matchers.js", "spec/unit/spec.modules.js", "spec/unit/spec.node.js", "spec/unit/spec.shared-behaviors.js", "spec/unit/spec.utils.js", "spec/unit/spec.xhr.js", "src/browsers.rb", "src/helpers.rb", "src/installables.rb", "src/project.rb", "src/routes.rb", "src/server.rb", "support/js.jar", "templates/default/History.md", "templates/default/Readme.md", "templates/default/lib/yourlib.js", "templates/default/spec/commands/example_command.rb", "templates/default/spec/dom.html", "templates/default/spec/node.js", "templates/default/spec/rhino.js", "templates/default/spec/server.html", "templates/default/spec/server.rb", "templates/default/spec/unit/spec.helper.js", "templates/default/spec/unit/spec.js", "templates/node/History.md", "templates/node/Readme.md", "templates/node/lib/yourlib.js", "templates/node/spec/node.js", "templates/node/spec/unit/spec.helper.js", "templates/node/spec/unit/spec.js", "templates/rails/commands/example_commands.rb", "templates/rails/dom.html", "templates/rails/rhino.js", "templates/rails/server.html", "templates/rails/server.rb", "templates/rails/unit/spec.helper.js", "templates/rails/unit/spec.js"]
  s.homepage = %q{http://visionmedia.github.com/jspec}
  s.rdoc_options = ["--line-numbers", "--inline-source", "--title", "Jspec", "--main", "README.md"]
  s.require_paths = ["lib"]
  s.rubyforge_project = %q{jspec}
  s.rubygems_version = %q{1.3.6}
  s.summary = %q{JavaScript BDD Testing Framework}

  if s.respond_to? :specification_version then
    current_version = Gem::Specification::CURRENT_SPECIFICATION_VERSION
    s.specification_version = 3

    if Gem::Version.new(Gem::RubyGemsVersion) >= Gem::Version.new('1.2.0') then
      s.add_runtime_dependency(%q<sinatra>, [">= 0"])
      s.add_runtime_dependency(%q<json_pure>, [">= 0"])
      s.add_runtime_dependency(%q<commander>, [">= 4.0.1"])
      s.add_runtime_dependency(%q<bind>, [">= 0.2.8"])
    else
      s.add_dependency(%q<sinatra>, [">= 0"])
      s.add_dependency(%q<json_pure>, [">= 0"])
      s.add_dependency(%q<commander>, [">= 4.0.1"])
      s.add_dependency(%q<bind>, [">= 0.2.8"])
    end
  else
    s.add_dependency(%q<sinatra>, [">= 0"])
    s.add_dependency(%q<json_pure>, [">= 0"])
    s.add_dependency(%q<commander>, [">= 4.0.1"])
    s.add_dependency(%q<bind>, [">= 0.2.8"])
  end
end
