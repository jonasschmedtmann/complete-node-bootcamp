
desc "JS lint the project.  Must have jsl installed in path"
task :jsl do
  def jsl_file(filename)
    puts `jsl -process #{filename}`
  end

  files = [
    Dir.glob("lib/**/*.js"),
    Dir.glob("spec/unit/**/*.js"),
    "spec/node.js"
  ].flatten

  files.each do |file|
    unless file =~ /vendor/
      jsl_file(file)
    end
  end
end

desc "Run specs by opening in browser.  Only works on OS X"
task :spec do
  sh "node spec/node.js"
end

task :default => [:jsl, :spec]
