
module JSpec
  
  #--
  # Base project
  #++
  
  class Project
    
    #--
    # Constants
    #++
    
    BIND_PATHS = 'lib/**/*.js', 'spec/**/*.js'
    RHINO = JSPEC_ROOT + '/support/js.jar'
    
    ##
    # Destination directory.
    
    attr_reader :dest
    
    ##
    # Initialize project with _dest_.
    
    def initialize dest
      @dest = dest || '.'
    end
    
    ##
    # Execute _file_ with Node.js
    
    def node file
      system "node #{file}"
    end
    
    ##
    # Execute _file_ with Rhino.

    def rhino file
      system "java -jar #{rhino_jar} #{file}"
    end
    
    ##
    # Locate Rhino jar.
    #
    #  * checks spec/support/js.jar
    #  * defaults to JSpec's support/js.jar
    #
    
    def rhino_jar
      if File.exists? normalize('support/js.jar')
        normalize 'support/js.jar'
      else
        RHINO
      end
    end
    
    ##
    # Install project _name_ with _options_.
    
    def install name, options = {}
      raise ArgumentError, ':to option required' unless options.include? :to
      project = JSpec::Installable.const_get(name.downcase.capitalize).new options
      if project.use_progress_bar?
        progress [:before, :install, :after], 
          :complete_message => project.install_message,
          :format => "Installing #{name} (:progress_bar) %:percent_complete" do |method|
          project.send method
        end
      else
        project.before
        project.install
        project.after
        say project.install_message
      end
    end
    
    ##
    # Initialize the project with _options_

    def init! options = {}
      verify_empty!
      copy_template options[:node] ? :node : :default
      vendorize_with_symlink if options.include? :symlink
      vendorize_with_copy if options.include? :freeze
      replace_root
    end
    
    ##
    # Vendorize JSpec with symlink.
    
    def vendorize_with_symlink
      FileUtils.symlink "#{JSPEC_ROOT}/lib", normalize('lib'), :force => true
    end
    
    ##
    # Vendorize JSpec with copy.
    
    def vendorize_with_copy
      FileUtils.cp_r "#{JSPEC_ROOT}/lib", normalize('lib')
    end
    
    ##
    # Copy template _name_ to the destination.
    
    def copy_template name, options = {}
      FileUtils.mkdir_p dest
      FileUtils.cp_r path_to_template(name), options[:to] ?
        "#{dest}/#{options[:to]}" :
          dest
    end
    
    ##
    # Normalize _path_.
    
    def normalize path
      "#{dest}/spec/#{path}"
    end
    
    ##
    # Check if we are working with vendorized JSpec.
    
    def vendorized?
      File.directory?(normalize(:lib)) && normalize(:lib)
    end
    
    ##
    # Replace absolute JSPEC_ROOT paths.
    
    def replace_root
      replace_root_in 'dom.html', 'rhino.js', 'node.js'
    end
    
    ##
    # Root JSpec directory.
    
    def root
      vendorized? ? './spec' : JSPEC_ROOT
    end
    
    ##
    # Replace absolute JSPEC_ROOT _paths_.
    
    def replace_root_in *paths
      paths.each do |path|
        next unless File.exists? normalize(path)
        jspec_root = root
        jspec_root = '.' if vendorized? and path.include? '.html'
        contents = File.read(normalize(path)).gsub 'JSPEC_ROOT', jspec_root
        File.open(normalize(path), 'w') { |file| file.write contents }
      end
    end
    
    ##
    # Path to template _name_.
    
    def path_to_template name
      "#{JSPEC_ROOT}/templates/#{name}/."
    end
    
    ##
    # Verify that the current directory is empty, otherwise 
    # prompt for continuation.
    
    def verify_empty!
      unless Dir[dest + '/*'].empty?
        abort unless agree "`#{dest}' is not empty; continue? "
      end
    end
    
    ##
    # Update absolute paths and/or vendorized libraries.
    
    def update!
      if path = vendorized?
        type = File.symlink?(path) ? :symlink : :copy
        FileUtils.rm_rf normalize(:lib)
        send "vendorize_with_#{type}"
        say "updated #{type} #{path} -> #{program(:version)}"
      else
        ['dom.html', 'rhino.js', 'node.js'].each do |path|
          path = normalize path
          next unless File.exists? path
          contents = File.read(path).gsub /jspec-(\d+\.\d+\.\d+)/, "jspec-#{program(:version)}"
          if program(:version) == $1
            say "skipping #{path}; already #{$1}"
            next
          end
          File.open(path, 'r+'){ |file| file.write contents } 
          say "updated #{path}; #{$1} -> #{program(:version)}"
        end
      end
    end
    
    ##
    # Start server with _path_ html and _options_.

    def start_server path, options = {}
      options[:port] ||= 4444
      set :port, options[:port]
      set :server, 'Mongrel'
      enable :sessions
      disable :logging
      hook = File.expand_path normalize('server.rb')
      load hook if File.exists? hook
      browsers = browsers_for(options[:browsers]) if options.include? :browsers
      JSpec::Server.new(path, options[:port]).start(browsers)
    end

    ##
    # Return array of browser instances for the given _names_.

    def browsers_for names
      names.map do |name|
        begin
          Browser.subclasses.find do |browser|
            browser.matches_name? name
          end.new
        rescue
          raise "Unsupported browser `#{name}'"
        end
      end
    end
    
    ##
    # Run _path_ with _options_.
    
    def run! path = nil, options = {}
      paths = options[:paths] || self.class::BIND_PATHS

      # Action
      
      case
      when options.include?(:node)
        path ||= normalize('node.js')
        action = lambda { node(path) }
      when options.include?(:rhino)
        path ||= normalize('rhino.js')
        action = lambda { rhino(path) }
      when options.include?(:server)
        raise 'Cannot use --bind with --server' if options.include? :bind
        path ||= normalize('server.html')
        action = lambda { start_server path, options }
      else
        path ||= normalize('dom.html')
        browsers = browsers_for options[:browsers] || ['default']
        action = lambda do
          browsers.each do |browser|
            browser.visit File.expand_path(path)
          end
        end
      end 
      
      # Bind action
      
      if options.include? :bind
        Bind::Listener.new(
          :paths => paths,
          :interval => 1,
          :actions => [action],
          :debug => $stdout).run!
      else
        exit !! action.call
      end
    end
    
    ##
    # Return the Project instance which should be used for _dest_. 
    
    def self.for dest
      (File.directory?("#{dest}/vendor") ? 
        JSpec::Project::Rails : 
          JSpec::Project).new(dest)
    end
    
    ##
    # Load all commands at the given _dir_.
    
    def self.load_commands_at dir
      Dir["#{dir}/**/*_command.rb"].each { |file| load file }
    end
    
    #--
    # Rails project
    #++
    
    class Rails < self
      
      #--
      # Constants
      #++
      
      BIND_PATHS = 'public/javascripts/**/*.js', 'jspec/**/*.js'
      
      ##
      # Initialize the project with _options_

      def init! options = {}
        verify_rails!
        copy_template :rails, :to => :jspec
        vendorize_with_symlink if options.include? :symlink
        vendorize_with_copy if options.include? :freeze
        replace_root
      end
      
      ##
      # Root JSpec directory.

      def root
        vendorized? ? './jspec' : JSPEC_ROOT
      end
      
      ##
      # Normalize _path_.

      def normalize path
        "#{dest}/jspec/#{path}"
      end
      
      ##
      # Verify that the current directory is rails, otherwise 
      # prompt for continuation.

      def verify_rails!
        unless rails?
          abort unless agree "`#{dest}' does not appear to be a rails app; continue? "
        end
      end
      
      ##
      # Check if the destination is the root of 
      # a rails application.
      
      def rails?
        File.directory? dest + '/vendor'
      end
      
    end
    
  end
end
