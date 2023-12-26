
describe 'Utility'
  describe 'fixture()'
    it 'should return a files contents'
      fixture('test.html').should.eql '<p>test</p>'
      fixture('test').should.eql '<p>test</p>'
    end
    
    it 'should cache contents'
      contents = fixture('test')
      JSpec.cache['test'].should.eql contents
      JSpec.cache['test'] = 'foo'
      fixture('test').should.eql 'foo'
      delete JSpec.cache['test']
    end
  end
  
  describe 'json_fixture()'
    it 'should evaluate json fixtures'
      json_fixture('test').should.eql { users : { tj : { email : 'tj@vision-media.ca' }}}
      json_fixture('test.json').should.eql { users : { tj : { email : 'tj@vision-media.ca' }}}
    end
  end
end