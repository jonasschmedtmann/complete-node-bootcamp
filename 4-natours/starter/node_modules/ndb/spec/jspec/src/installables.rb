
require 'open-uri'

module JSpec
  class Installable
    
    ##
    # Options array
    
    attr_reader :options
    
    ##
    # Initialize with _options_
    
    def initialize options = {}
      @options = options
    end
    
    ##
    # Called before installing.
    
    def before; end
    
    ##
    # Called after installing.
    
    def after; end
    
    ##
    # Message to display after installation.
    
    def install_message; end
    
    ##
    # Weither or not to use the progress bar.
    
    def use_progress_bar?; true end
    
    #--
    # URI based installations
    #++
    
    class URI < self

      ##
      # Release specified or the current release.
      
      def release
        options[:release] || self.class.current
      end
      
      ##
      # Installation path.
      
      def path
        options[:to] + "/#{self.class.name.downcase.tr(' ', '.')}.js"
      end
      
      ##
      # Installation uri.
      
      def uri
        self.class.uri.sub 'RELEASE', release
      end
      
      ##
      # Install.
      
      def install
        File.open(path, 'w+') do |file|
          file.write open(uri).read
        end
      end
      
      ##
      # Installation message.
      
      def install_message
        "#{self.class.name} #{release} installed to #{path}"
      end
      
      #--
      # DSL
      #++
      
      class << self
        
        ##
        # Human readable name.
        
        def name string = nil
          string ? @name = string : @name
        end
        
        ##
        # Current release _string_.
        
        def current string = nil
          string ? @current = string : @current
        end
        
        ##
        # Installable uri _string_. use RELEASE as the release placeholder.
        
        def uri string = nil
          string ? @uri = string : @uri
        end
      end

    end
    
    #--
    # Rhino
    #++
    
    class Rhino < URI
      name 'Rhino'
      uri 'ftp://ftp.mozilla.org/pub/mozilla.org/js/RELEASE.zip'
      
      ##
      # No thanks!
      
      def use_progress_bar?
        false
      end
      
      ##
      # Extension destination.
      
      def path
        options[:to] + '/js.jar'
      end
      
      ##
      # Warn that --release is not yet supported.
      
      def release
        warn 'Rhino does not yet support --release' if options[:release]
        'rhino1_7R2'
      end
      
      ##
      # Install
      
      def install
        say "... fetching #{uri}"; `curl #{uri} -o /tmp/rhino.zip 2> /dev/null`
        say "... decompressing"; `unzip /tmp/rhino.zip -d /tmp`
        say "... installing to #{path}"; `mv /tmp/rhino1_7R2/js.jar #{path}`
      end
      
    end
    
    #--
    # Envjs
    #++
    
    class Envjs < URI
      name 'Env.js'
      uri 'http://github.com/thatcher/env-js/raw/master/dist/env.rhino.js'
      
      ##
      # Warn that --release is not yet supported.
      
      def release
        warn 'Envjs does not yet support --release' if options[:release]
        'edge'
      end
      
      ##
      # Installation path.
      
      def path
        options[:to] + '/env.js'
      end
      
    end
    
    #--
    # jQuery
    #++
    
    class Jquery < URI
      name 'jQuery'
      current '1.3.2'
      uri 'http://ajax.googleapis.com/ajax/libs/jquery/RELEASE/jquery.js'
    end
    
    #--
    # jQuery UI.
    #++
    
    class Jqueryui < URI
      name 'jQuery UI'
      current '1.7.2'
      uri 'http://ajax.googleapis.com/ajax/libs/jqueryui/RELEASE/jquery-ui.js'
    end
    
    #--
    # Prototype
    #++
    
    class Prototype < URI
      name 'Prototype'
      current '1.6.1.0'
      uri 'http://ajax.googleapis.com/ajax/libs/prototype/RELEASE/prototype.js'
    end
    
    #--
    # MooTools
    #++
    
    class Mootools < URI
      name 'MooTools'
      current '1.2.3'
      uri 'http://ajax.googleapis.com/ajax/libs/mootools/RELEASE/mootools.js'
    end
    
    #--
    # Dojo
    #++
    
    class Dojo < URI
      name 'Dojo'
      current '1.3.2'
      uri 'http://ajax.googleapis.com/ajax/libs/dojo/RELEASE/dojo/dojo.xd.js.uncompressed.js'
    end
    
  end
end