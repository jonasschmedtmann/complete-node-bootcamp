
describe 'Utility'
  describe 'fail()'
    it 'should fail the current spec'
      spec = mock_it(function() {
        fail('I failed!')
      })
      spec.should.have_failure_message('I failed!')
    end
  end
  
  describe 'pass()'
    it 'should pass the current spec'
      pass('yay')
      pass('wahoo')
    end
  end
  
  describe 'stubbing'
    before_each
      Object.prototype.stubby = function() { return 'Not stubbed' }
      object = { toString : function() { return '<Im an object>' }}
      stub(object, 'stubby').and_return('Im stubbed')
      stub(object, 'toString').and_return('<No im not>')
    end
    
    after_each
      delete Object.prototype.stubby
    end

    describe 'stub()'
      it 'should stub :)'
        object.stubby().should.eql 'Im stubbed'
        object.toString().should.eql '<No im not>'
      end
      
      it 'should allow being called as a core prototype method'
        foo = { bar : function(){ return 'baz' }}
        foo.stub('bar').and_return('something else')
        foo.bar().should.eql 'something else'
        foo.destub()
        foo.bar().should.eql 'baz'
      end
      
      it 'should stub methods starting with an underscore'
        object._foo = function(){ return 'bar' }
        object.stub('_foo').and_return('something else')
        object._foo().should.eql 'something else'
        object.destub()
        object._foo().should.eql 'bar'
      end
      
      it 'should stub methods with whitespace'
        object['foo bar'] = function(){ return 'rawr' }
        object.stub('foo bar').and_return('baz')
        object['foo bar']().should.eql 'baz'
        object.destub()
        object['foo bar']().should.eql 'rawr'
      end
      
      it 'should stub with arbitrary method when no return value is set'
        object.stub(' super cool ')
        object[' super cool '].should.be_a Function
        destub(object)
        object[' super cool '].should.be_null
      end
      
      it 'should stub sub properties using the JSpec grammar'
        object = { foo : { bar : {}}}
        object.foo.bar.stub('kitten').and_return('meow')
        object.foo.bar.kitten().should.eql 'meow'
        object.foo.bar.destub()
        object.foo.bar.should.not.respond_to('kitten')
      end
      
      it 'should allow functions to be passed as a method'
        stub(object, 'post').and_return(function(url, callback){
          if (url == 'http://jspec.info')
            callback('is awesome')
        })
        object.post('http://jspec.info', function(text){
          text.should_eql 'is awesome'
        })
      end
    end
    
    describe 'destub()'
      it 'should restore old methods'
        destub(object, 'toString')
        destub(object, 'stubby')
        object.toString().should.eql '<Im an object>'
        object.stubby().should.eql 'Not stubbed'
      end
      
      it 'should restore prototypal methods'
        Object.prototype.stubby = function() { return 'Oh no im new' }
        destub(object, 'stubby')
        object.stubby().should.eql 'Oh no im new'
      end
      
      it 'should destub all methods stubbed related to the object passed when no method is given'
        destub(object)
        object.toString().should.eql '<Im an object>'
        object.stubby().should.eql 'Not stubbed'
      end
      
      describe 'should restore after each spec'
        before
          a = { toString : function(){ return 'Wahoo' }}
          b = { toString : function(){ return 'Wahhhhhooo' }}
        end
        
        it 'should stub'
          stub(a, 'toString').and_return('Oh no')
          stub(b, 'toString').and_return('Oh noooo')
          a.toString().should.eql 'Oh no'
          b.toString().should.eql 'Oh noooo'
        end
        
        it 'should restore'
          a.toString().should.eql 'Wahoo'
          b.toString().should.eql 'Wahhhhhooo'
        end
      end
    end
  end
  
  describe 'query()'
    it 'should return a pairs value'
      query('suite', '?suite=Positive%20specs').should.equal 'Positive specs'
    end
    
    it 'should return null when key is not present'
      query('foo', '?suite=Positive%20specs').should.be_null
    end
  end
  
  describe 'strip()'
    it 'should strip whitespace by default'
      strip(" foo \n\n").should.equal 'foo'
    end
    
    it 'should strip the characters passed'
      strip('[foo]', '\\[\\]').should.equal 'foo'
    end
  end
  
  describe 'each()'
    it 'should iterate an array'
      result = []
      each([1,2,3], function(value){
        result.push(value)
      })
      result.should.eql [1,2,3]
    end
  end
  
  describe 'map()'
    it 'should return an array of mapped values'
      result = map([1,2,3], function(value){
        return value * 2
      })
      result.should.eql [2,4,6]
    end
  end
  
  describe 'inject()'
    it 'should provide a memo object while iterating, not expecting returning of memo for composits'
      result = inject([1,2,3], [], function(memo, value){
        memo.push(value)
      })
      result.should.eql [1,2,3]
    end
    
    it 'should require returning of memo for scalar variables'
      result = inject([1,2,3], false, function(memo, value){
        return memo ? memo : value == 2
      })
      result.should.be_true
    end
  end
  
  describe 'any()'
    it 'should return null when no matches are found'
      result = any('some foo bar', function(value){
        return value.length > 5
      })
      result.should.be_null
    end
    
    it 'should return the value of the first matching expression'
      result = any(['foo', 'some', 'bar'], function(value){
        return value.length > 3
      })
      result.should.eql 'some'
    end
    
    describe 'haveStopped'
      it 'should check if "stop" has been returned by a callback hook'
        any([true, 'stop'], haveStopped).should.eql 'stop'
        any([true, true], haveStopped).should.be_null
        any([true, null], haveStopped).should.be_null
      end
    end
  end
  
  describe 'select()'
    it 'should return an array of values when the callback evaluates to true'
      result = select(['some', 'foo', 'bar', 'baz', 'stuff'], function(value){
        return value.length > 3
      })
      result.should.eql ['some', 'stuff']
    end
  end
  
  describe 'last()'
    it 'should return the last element in an array'
      last(['foo', 'bar']).should.eql 'bar'
    end
  end
  
  describe 'toArray()'
    it 'should convert an arraylike object to an array'
      func = function(){ return toArray(arguments) }
      func('foo', 'bar').should.eql ['foo', 'bar']
    end
    
    it 'should allow a slice offset'
      func = function(){ return toArray(arguments, 2) }
      func('foo', 'bar', 'baz').should.eql ['baz']
    end
  end
  
  describe 'does()'
    it 'should assert without reporting'
      does('foo', 'eql', 'foo')
      JSpec.currentSpec.assertions.should.have_length 0
    end
  end
  
  describe 'contentsOf()'
    it 'should return a function body'
      JSpec.contentsOf(-{ return 'foo' }).should.include 'return', 'foo'
    end
  end
  
  describe 'puts()'
    describe 'with primitive scalar values'
      it 'should output true'
        puts(true).should.eql 'true'
      end
      
      it 'should output false'
        puts(false).should.eql 'false'
      end
      
      it 'should output null'
        puts(null).should.eql 'null'
      end
      
      it 'should output undefined'
        puts().should.eql 'undefined'
      end
    end
    
    describe 'with strings'
      it 'should output within double quotes'
        puts("string").should.eql '"string"'
      end

      it 'should escape double quotes'
        puts('he said "hey"').should.eql '"he said \\"hey\\""'
      end

      it 'should output non-printables as \n \t etc'
        puts("\n\t\n\t").should.eql '"\\n\\t\\n\\t"'
      end
    end
    
    describe 'with arrays'
      it 'should output an array literal'
        puts([1, 2, 3]).should.eql '[ 1, 2, 3 ]'
      end
      
      it 'should output nested arrays'
        puts([1, 2, [ 1, 2 ]]).should.eql '[ 1, 2, [ 1, 2 ] ]'
      end
      
      it 'should output empty arrays'
        puts([]).should.eql '[ ]'
      end
    end
    
    describe 'with integers'
      it 'should output an integer literal'
        puts(1).should.eql '1'
        puts(10).should.eql '10'
      end
    end
    
    describe 'with floats'
      it 'should output a float literal'
        puts(1.5).should.eql '1.5'
      end
    end
    
    describe 'with regular expressions'
      it 'should output a regexp literal'
        puts(/test/).should.eql '/test/'
      end
      
      it 'should output flags as well'
        puts(/test/gm).should.eql '/test/gm'
      end
    end
    
    describe 'with hashes'
      it 'should output an object literal'
        puts({ foo: 'bar' }).should.eql '{ foo: "bar" }'
      end
      
      it 'should output nested objects'
        puts({ foo: { bar: 'baz' }}).should.eql '{ foo: { bar: "baz" } }'
      end
      
      it 'should output empty objects'
        puts({}).should.eql '{ }'
      end
    end
    
    describe 'with an_instance_of'
      it 'should output an instance of Constructor'
        object = { an_instance_of: Array }
        puts(object).should.eql 'an instance of Array'
      end
    end
    
    describe 'circular references'
      it 'should output <circular reference> with objects'
        object = { a: 1 }
        object.b = object
        puts(object).should.eql '{ a: 1, b: <circular reference> }'
      end
    end
  end
end
