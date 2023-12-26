
require 'rbconfig'

#--
# Browser
#++
 
class Browser
  
  ##
  # Check if the user agent _string_ matches this browser.
  
  def self.matches_agent? string; end
  
  ##
  # Check if the browser matches the name _string_.
  
  def self.matches_name? string; end
    
  ##
  # Subclasses.
  
  def self.subclasses
    @subclasses ||= []
  end
  
  ##
  # Stack subclasses.
  
  def self.inherited subclass
    subclasses << subclass
  end
  
  ##
  # Whether or not the browser is supported.
  
  def supported?; true end
  
  ##
  # Server setup.
  
  def setup; end
  
  ##
  # Server teardown.
  
  def teardown; end
  
  ##
  # Host environment.
 
  def host
    Config::CONFIG['host_os']
  end
  
  ##
  # Check if we are using macos.
  
  def macos?
    host.include? 'darwin'
  end
  
  ##
  # Check if we are using windows.
  
  def windows?
    host =~ /mswin|mingw/
  end
  
  ##
  # Check if we are using linux.
  
  def linux?
    host.include? 'linux'
  end
  
  ##
  # Run applescript _code_.
  
  def applescript code
    raise "Can't run AppleScript on #{host}" unless macos?
    system "osascript -e '#{code}' 2>&1 >/dev/null"
  end
  
  #--
  # Default
  #++
  
  class Default < self
    def self.matches_name? string
      string =~ /default/i
    end
    
    def visit uri
      system 'open', uri if macos?
      system 'start', uri if windows?
      system 'xdg-open', uri if linux?
    end
    
    def to_s
      'Default'
    end
  end
  
  #--
  # Firefox
  #++
  
  class Firefox < self
    def self.matches_agent? string
      string =~ /firefox/i
    end
    
    def self.matches_name? string
      string =~ /ff|firefox|mozilla/i
    end
    
    def visit uri
      system "open -g -a Firefox '#{uri}'" if macos?
      system "firefox #{uri}" if linux?
      system "#{File.join(ENV['ProgramFiles'] || 'c:\Program Files', '\Mozilla Firefox\firefox.exe')} #{uri}" if windows? 
    end
    
    def to_s
      'Firefox'
    end
  end
  
  #--
  # Safari
  #++
  
  class Safari < self
    def self.matches_agent? string
      string =~ /safari/i && string !~ /chrome/i
    end
    
    def self.matches_name? string
      string =~ /safari/i
    end
    
    def supported?
      macos?
    end

    def setup
      applescript 'tell application "Safari" to make new document'
    end           
                  
    def visit uri 
      applescript 'tell application "Safari" to set URL of front document to "' + uri + '"'
    end
    
    def matches_agent? string
      string =~ /safari/i
    end

    def to_s
      'Safari'
    end
  end
  
  #--
  # Chrome
  #++
  
  class Chrome < self
    def self.matches_agent? string
      string =~ /chrome/i
    end
    
    def self.matches_name? string
      string =~ /google|chrome/i
    end
    
    def supported?
      macos? or linux?
    end
    
    def visit uri
      system "open -g -a 'Google Chrome' #{uri}" if macos?
      system "google-chrome #{uri}" if linux?
    end
    
    def to_s
      'Chrome'
    end
  end
  
  #--
  # WebKit
  #++
  
  class WebKit < self
    def self.matches_agent? string
      string =~ / AppleWebKit\/[\d\.]+\+/i
    end
    
    def self.matches_name? string
      string =~ /webkit|wk/i
    end
    
    def supported?
      macos?
    end
    
    def setup
      applescript 'tell application "WebKit" to make new document'
    end           
    
    def visit uri 
      applescript 'tell application "WebKit" to set URL of front document to "' + uri + '"'
    end
    
    def to_s
      'WebKit Nightly'
    end
  end
  
  #--
  # Chromium
  #++

  class Chromium < self
    def self.matches_agent? string
      string =~ /chrome/i
    end

    def self.matches_name? string
      string =~ /chromium/i
    end

    def supported?
      linux?
    end

    def visit uri
      system "chromium #{uri}" if linux?
    end

    def to_s
      'Chromium'
    end
  end

  #--
  # Internet Explorer
  #++
  
  class IE < self
    def self.matches_agent? string
      string =~ /microsoft/i
    end
    
    def self.matches_name? string
      string =~ /ie|explorer/i
    end
    
    def supported?
      windows?
    end
    
    def setup
      require 'win32ole'
    end

    def visit uri
      ie = WIN32OLE.new 'InternetExplorer.Application'
      ie.visible = true
      ie.Navigate uri
      while ie.ReadyState != 4 do
        sleep 1
      end
    end

    def to_s
      'Internet Explorer'
    end
  end
  
  #--
  # Opera
  #++
  
  class Opera < self
    def self.matches_agent? string
      string =~ /opera/i
    end
    
    def self.matches_name? string
      string =~ /opera/i
    end
    
    def visit uri
      system "open -g -a Opera #{uri}" if macos?
      system "c:\Program Files\Opera\Opera.exe #{uri}" if windows? 
      system "opera #{uri}" if linux?
    end
    
    def to_s
      'Opera'
    end
  end
  
end
