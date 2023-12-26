
require 'rubygems'
require 'rake'
require 'echoe'

def version
  $1 if File.read('lib/jspec.js').match /version *: *'(.*?)'/
end

Echoe.new "jspec", version do |p|
  p.author = "TJ Holowaychuk"
  p.email = "tj@vision-media.ca"
  p.summary = "JavaScript BDD Testing Framework"
  p.url = "http://visionmedia.github.com/jspec"
  p.runtime_dependencies << "sinatra"
  p.runtime_dependencies << "json_pure"
  p.runtime_dependencies << "commander >=4.0.1"
  p.runtime_dependencies << "bind >=0.2.8"
end

namespace :spec do
  desc 'Run jspec executable specs'
  task :bin do
    sh 'spec --color --require spec/ruby/bin/spec_helper.rb spec/ruby/bin/*_spec.rb'
  end
end

task :gemspec => :build_gemspec