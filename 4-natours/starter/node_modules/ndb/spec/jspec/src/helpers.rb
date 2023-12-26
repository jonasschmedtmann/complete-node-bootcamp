
helpers do
  
  ##
  # Return dotted assertion graph for _assertions_.
  
  def assertion_graph_for assertions
    return if assertions.empty?
    assertions.map do |assertion|
      assertion['passed'] ? green('.') : red('.')
    end.join
  end
  
  ##
  # Override Sinatra's #send_file to prevent caching.
  
  def send_file *args
    response['Cache-Control'] = 'no-cache'
    super
  end
  
  ##
  # Find the browser name for the current user agent.
  
  def browser_name
    Browser.subclasses.find do |browser|
      browser.matches_agent? env['HTTP_USER_AGENT']
    end.new
  rescue
    'Unknown'
  end
  
  ##
  # Wrap _string_ with ansi escape sequence using _code_.
  
  def color string, code
    "\e[#{code}m#{string}\e[0m"
  end
  
  ##
  # Bold _string_.
  
  def bold string
    color string, 1
  end
  
  ##
  # Color _string_ red.
  
  def red string  
    color string, 31
  end
  
  ##
  # Color _string_ green.
  
  def green string
    color string, 32
  end
  
  ##
  # Color _string_ blue.
  
  def blue string
    color string, 34
  end
end