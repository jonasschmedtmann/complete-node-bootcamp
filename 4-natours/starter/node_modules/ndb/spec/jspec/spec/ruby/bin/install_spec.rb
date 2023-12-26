
include FileUtils

describe "jspec" do
  describe "install" do
    before :each do
      @dest = File.dirname(__FILE__) + '/test'
      mkdir @dest  
      jspec(:init, @dest)
    end
    
    after :each do
      rm_rf @dest
    end
    
    describe "jquery" do
      it "should install to spec/support/jquery.js by default" do
        Dir.chdir @dest do
          jspec(:install, 'jquery')
          File.exists?('spec/support/jquery.js').should be_true
        end
      end
      
      it "should install to the destination passed" do
        jspec(:install, 'jquery', "#{@dest}/spec")
        File.exists?("#{@dest}/spec/jquery.js").should be_true
      end
      
      it "should install specific versions" do
        Dir.chdir @dest do
          jspec(:install, 'jquery', '--release', '1.3.1')
          File.exists?('spec/support/jquery.js').should be_true
          File.read('spec/support/jquery.js').should include('1.3.1')
        end
      end
    end
    
    describe "jqueryui" do
      it "should install to spec/support/jquery.ui.js by default" do
        Dir.chdir @dest do
          jspec(:install, 'jqueryui')
          File.exists?('spec/support/jquery.ui.js').should be_true
        end
      end
      
      it "should install to the destination passed" do
        jspec(:install, 'jqueryui', "#{@dest}/spec")
        File.exists?("#{@dest}/spec/jquery.ui.js").should be_true
      end
      
      it "should install specific versions" do
        Dir.chdir @dest do
          jspec(:install, 'jqueryui', '--release', '1.6')
          File.exists?('spec/support/jquery.ui.js').should be_true
          File.read('spec/support/jquery.ui.js').should include('1.6')
        end
      end
    end
    
    describe "prototype" do
      it "should install to spec/support/prototype.js by default" do
        Dir.chdir @dest do
          jspec(:install, 'prototype')
          File.exists?('spec/support/prototype.js').should be_true
        end
      end
      
      it "should install to the destination passed" do
        jspec(:install, 'prototype', "#{@dest}/spec")
        File.exists?("#{@dest}/spec/prototype.js").should be_true
      end
      
      it "should install specific versions" do
        Dir.chdir @dest do
          jspec(:install, 'prototype', '--release', '1.6.0.2')
          File.exists?('spec/support/prototype.js').should be_true
          File.read('spec/support/prototype.js').should include('1.6.0.2')
        end
      end
    end
    
    describe "mootools" do
      it "should install to spec/support/mootools.js by default" do
        Dir.chdir @dest do
          jspec(:install, 'mootools')
          File.exists?('spec/support/mootools.js').should be_true
        end
      end
      
      it "should install to the destination passed" do
        jspec(:install, 'mootools', "#{@dest}/spec")
        File.exists?("#{@dest}/spec/mootools.js").should be_true
      end
      
      it "should install specific versions" do
        Dir.chdir @dest do
          jspec(:install, 'mootools', '--release', '1.2.1')
          File.exists?('spec/support/mootools.js').should be_true
          File.read('spec/support/mootools.js').should include('1.2.1')
        end
      end
    end

    describe "envjs" do
      it "should install to spec/support/env.js by default" do
        Dir.chdir @dest do
          jspec(:install, 'envjs')
          File.exists?('spec/support/env.js').should be_true
        end
      end
      
      it "should install to the destination passed" do
        jspec(:install, 'envjs', "#{@dest}/spec")
        File.exists?("#{@dest}/spec/env.js").should be_true
      end
    end
    
    describe "dojo" do
      it "should install to spec/support/dojo.js by default" do
        Dir.chdir @dest do
          jspec(:install, 'dojo')
          File.exists?('spec/support/dojo.js').should be_true
        end
      end
      
      it "should install to the destination passed" do
        jspec(:install, 'dojo', "#{@dest}/spec")
        File.exists?("#{@dest}/spec/dojo.js").should be_true
      end
      
      it "should install specific versions" do
        Dir.chdir @dest do
          jspec(:install, 'dojo', '--release', '1.1.1')
          File.exists?('spec/support/dojo.js').should be_true
          File.read('spec/support/dojo.js').should include('1.1.1')
        end
      end
    end
    
  end
end