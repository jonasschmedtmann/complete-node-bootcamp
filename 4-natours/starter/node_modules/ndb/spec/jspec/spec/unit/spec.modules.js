
describe 'JSpec'
  describe 'module'
    describe 'hooks'
      it 'should run beforeSpec'
        addedBeforeSpec.should.be_true
      end
      
      it 'should run afterSpec'
        addedAfterSpec.should.be_true
      end
      
      describe 'with suites'
        it 'should run beforeSuite'
          addedBeforeSuite.should.be_true
        end
      end
      
      it 'should run afterSuite'
        addedAfterSuite.should.be_true
      end
    end
    
    describe '.hook()'
      it 'should invoke hooks, returning an array of results'
        results = hook('randomHook', 'foo', 'bar')
        results.should.eql [['foo', 'bar']]
      end
    end
    
    describe '.utilities'
      it 'should be merged with the default utilities'
        doFoo().should.eql 'foo'
        doBar().should.eql 'bar'
      end
    end
    
    describe '.matchers'
      it 'should be merged with default matchers'
        'test'.should.be_foo_bar
      end
    end
    
    describe '.DSLs'
      it 'should be merged with default DSLs'
        JSpec.DSLs.snake.some_snake_case_stuff().should.be_true
        JSpec.DSLs.camel.someCamelCaseStuff().should.be_true
      end
    end
  end
end