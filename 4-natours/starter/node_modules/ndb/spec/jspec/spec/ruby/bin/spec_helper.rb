
require 'fileutils'

load File.dirname(__FILE__) + '/../../../bin/jspec'

def jspec *args
  `#{JSPEC_ROOT}/bin/jspec #{args.join(' ')}`
end
