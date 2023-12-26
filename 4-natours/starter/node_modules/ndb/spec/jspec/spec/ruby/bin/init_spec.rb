
include FileUtils

describe "jspec" do
  describe "init" do
    before :each do
      @dest = File.dirname(__FILE__) + '/test'
      mkdir @dest  
    end
    
    after :each do
      rm_rf @dest
    end
    
    it "should initialize a default project at the current directory when no destination is passed" do
      Dir.chdir @dest do
        jspec(:init)
        File.directory?(@dest).should be_true
      end
    end
    
    it "should initialize a default project at the given path" do
      jspec(:init, @dest).should include('ruby/bin/test')
      File.directory?(@dest).should be_true
    end
    
    it "should initialize a rails project when using -R or --rails" do
      mkdir @dest + '/vendor'
      jspec(:init, @dest, '--rails')
      File.directory?(@dest).should be_true
      File.directory?(@dest + '/jspec').should be_true
    end
    
    it "should initialize a rails project without --rails when the destination looks like a rails app" do
      mkdir @dest + '/vendor'
      jspec(:init, @dest)
      File.directory?(@dest).should be_true
      File.directory?(@dest + '/jspec').should be_true
    end
    
    it "should symlink jspec's library to spec/lib when using --symlink" do
      jspec(:init, @dest, '--symlink')
      File.directory?(@dest).should be_true
      File.symlink?(@dest + '/spec/lib').should be_true
    end
    
    it "should symlink jspec's library to jspec/lib when using --symlink and --rails" do
      mkdir @dest + '/vendor'
      jspec(:init, @dest, '--symlink', '--rails')
      File.directory?(@dest).should be_true
      File.directory?(@dest + '/jspec').should be_true
      File.symlink?(@dest + '/jspec/lib').should be_true
    end
    
    it "should vendorize jspec's library to spec/lib when using --freeze" do
      jspec(:init, @dest, '--freeze')
      File.directory?(@dest).should be_true
      File.directory?(@dest + '/spec/lib').should be_true
      File.exists?(@dest + '/spec/lib/jspec.js').should be_true
    end
    
    it "should vendor jspec's library to jspec/lib when using --freeze and --rails" do
      mkdir @dest + '/vendor'
      jspec(:init, @dest, '--freeze', '--rails')
      File.directory?(@dest).should be_true
      File.directory?(@dest + '/jspec').should be_true
      File.directory?(@dest + '/jspec/lib').should be_true
      File.exists?(@dest + '/jspec/lib/jspec.js').should be_true
    end
    
    it "should set jspec's DOM root to jspec's gem directory" do
      jspec(:init, @dest)
      File.read(@dest + '/spec/dom.html').should include('src="/')
    end
    
    it "should set jspec's DOM root to ../lib/ when using --freeze" do
      jspec(:init, @dest, '--freeze')
      File.read(@dest + '/spec/dom.html').should include('src="./lib/jspec.js')
    end
    
    it "should set jspec's DOM root to ../lib/ when using --symlink" do
      jspec(:init, @dest, '--symlink')
      File.read(@dest + '/spec/dom.html').should include('src="./lib/jspec.js')
    end
    
    it "should set jspec's Rhino root to jspec's gem directory" do
      jspec(:init, @dest)
      File.read(@dest + '/spec/rhino.js').should_not include("load('./spec/lib/jspec.js')")
    end
    
    it "should set jspec's Rhino root to ./spec/lib/ when using --freeze" do
      jspec(:init, @dest, '--freeze')
      File.read(@dest + '/spec/rhino.js').should include("load('./spec/lib/jspec.js')")
    end
    
    it "should set jspec's Rhino root to ./spec/lib/ when using --symlink" do
      jspec(:init, @dest, '--symlink')
      File.read(@dest + '/spec/rhino.js').should include("load('./spec/lib/jspec.js')")
    end
  end
end