
include FileUtils

describe "jspec" do
  describe "update" do
    before :each do
      @dest = File.dirname(__FILE__) + '/test'
      mkdir @dest  
    end
    
    after :each do
      rm_rf @dest
    end
    
    def mock_version_in path, &block
      File.open(path, 'w+') do |file|
        file.write 'src="/Some/path/jspec-1.1.0"'
      end
      yield path if block
    end
    
    it "should update absolute paths matching jspec-n.n.n" do
      jspec(:init, @dest)
      mock_version_in "#{@dest}/spec/dom.html" do |path|
        Dir.chdir(@dest) { jspec(:update) }
        File.read(path).should include("jspec-#{program(:version)}")
      end
    end
    
    it "should update absolute paths matching jspec-n.n.n for a rails project" do
      mkdir @dest + '/vendor'
      jspec(:init, @dest)
      mock_version_in "#{@dest}/jspec/dom.html" do |path|
        Dir.chdir(@dest) { jspec(:update) }
        File.read(path).should include("jspec-#{program(:version)}")
      end
    end
    
    it "should update absolute paths matching jspec-n.n.n when a destination is passed" do
      jspec(:init, @dest)
      mock_version_in "#{@dest}/spec/dom.html" do |path|
        jspec(:update, @dest)
        File.read(path).should include("jspec-#{program(:version)}")
      end
    end
    
    it "should update absolute paths matching jspec-n.n.n for a rails project when a destination in passed" do
      mkdir @dest + '/vendor'
      jspec(:init, @dest)
      mock_version_in "#{@dest}/jspec/dom.html" do |path|
        jspec(:update, @dest)
        File.read(path).should include("jspec-#{program(:version)}")
      end
    end
    
    it "should update projects initialized with --freeze" do
      jspec(:init, @dest, '--freeze')
      rm "#{@dest}/spec/lib/jspec.js"
      jspec(:update, @dest)
      File.exists?("#{@dest}/spec/lib/jspec.js").should be_true
    end
    
    it "should update rails projects initialized with --freeze" do
      mkdir @dest + '/vendor'
      jspec(:init, @dest, '--freeze')
      rm "#{@dest}/jspec/lib/jspec.js"
      jspec(:update, @dest)
      File.exists?("#{@dest}/jspec/lib/jspec.js").should be_true
    end
        
  end
end
