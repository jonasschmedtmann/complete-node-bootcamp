
get '/jspec/*' do |path|
  send_file JSPEC_ROOT + '/lib/' + path
end

post '/results' do
  require 'json/pure'
  data = JSON.parse request.body.read
  if data['options'].include?('verbose') && data['options']['verbose'] ||
     data['options'].include?('failuresOnly') && data['options']['failuresOnly']
    puts "\n\n %s Passes: %s Failures: %s\n\n" % [
      bold(browser_name), 
      green(data['stats']['passes']), 
      red(data['stats']['failures'])]
    data['results'].compact.each do |suite|
      specs = suite['specs'].compact.map do |spec|
        case spec['status'].to_sym
        when :pass 
          next if data['options'].include?('failuresOnly') && data['options']['failuresOnly']
          '  ' + green(spec['description']) + assertion_graph_for(spec['assertions']).to_s + "\n"
        when :fail
          "  #{red(spec['description'])}\n  #{spec['message']}\n\n"
        else
          "  #{blue(spec['description'])}\n" 
        end
      end.join
      unless specs.strip.empty?
        puts "\n " + bold(suite['description']) 
        puts specs
      end
    end
  else
    puts "%20s Passes: %s Failures: %s" % [
      bold(browser_name), 
      green(data['stats']['passes']), 
      red(data['stats']['failures'])]
  end
  halt 200
end

get '/*' do |path|
  pass unless File.exists? path
  send_file path
end

#--
# Simulation Routes
#++

get '/slow/*' do |seconds|
  sleep seconds.to_i
  halt 200
end

get '/status/*' do |code|
  halt code.to_i
end
