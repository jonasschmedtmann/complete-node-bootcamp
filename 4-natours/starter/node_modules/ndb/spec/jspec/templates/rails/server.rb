
get '/public/*' do |path|
  send_file File.dirname(__FILE__) + '/../public/' + path
end