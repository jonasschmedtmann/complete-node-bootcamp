
describe 'Matchers'

  describe 'eql'
    it 'should work with strings'
      'test'.should.eql 'test'
      'test'.should.not.eql 'foo'
    end
    
    it 'should work with numbers'
      11.should.eql 11
      10.should.not.eql 11
    end
    
    it 'should work with regular expressions'
      a = /foo/
      b = /foo/
      c = /foo/g
      d = /bar/
      a.should.eql a
      a.should.eql b
      a.should.not.eql c
      a.should.not.eql d
    end
    
    it 'should work with dates'
      a = new Date('May 25 1987')
      b = new Date('May 25 1987')
      c = new Date('May 25 1988')
      a.should.eql b
      a.should.not.eql c
    end
    
    it 'should work with arrays'
      [1, 2].should.eql [1, 2]
      [1, 2].should.not.eql [1, 3]
      [1, 2, [3], { foo : 'bar' }].should.eql [1, 2, [3], { foo : 'bar' }]
    end
    
    it 'should work with objects'
      { foo : 'bar' }.should.eql { foo : 'bar' }
    end
    
    it 'should hash compare objects with different orders'
      a = { one : 'two', three : 'four' }
      b = { three : 'four', one : 'two' }
      a.should.eql b
    end
    
    it 'should work with functions'
      function foo(){}
      function bar(){}
      foo.should.eql foo
      foo.should.not.eql bar
    end
    
    it 'should work with constructors'
      Array.should.eql Array
      Array.should.not.eql Object
    end
  end
  
  describe 'equal'
    it 'should perform strict comparisons'
      'test'.should.equal 'test'
      '1'.should.not.equal 1
      true.should.be true
      '1'.should.not.be true
    end
  end
  
  describe 'match'
    it 'should match regular expressions'
      'foobar'.should.match(/foo/)
      'foobar'.should.not.match(/barfoo/)
    end
  end
  
  describe 'be_empty'
    it 'should consider any object with zero length to be empty'
      ''.should.be_empty
      ' '.should.not.be_empty
      [].should.be_empty
      { length : 0 }.should.be_empty
      {}.should.be_empty
      'cookies'.should.not.be_empty
      [0].should.not.be_empty
      { length : 1 }.should.not.be_empty
      { foo : 'bar' }.should.not.be_empty
    end
  end
  
  describe 'be_null'
    it 'should check if a value is null'
      a = 0
      b = null
      null.should.be_null
      0.should.not.be_null
      a.should.not.be_null
      b.should.be_null
    end
  end
  
  describe 'be_undefined'
    it 'should check if a var is defined'
      var rawr
      rawr.should.be_undefined
    end
  end
  
  describe 'have_length'
    it 'should compare the length of an object'
      'foo'.should.have_length 3
      [1, 2].should.have_length 2
    end
  end
  
  describe 'have_length_within'
    it 'should check if an object has a length within the specified range'
      'foo'.should.have_length_within 2..4
      'f'.should.not.have_length_within 2..4
    end
  end
  
  describe 'have_prop'
    it 'should check if a property exists'
      'foo'.should.have_prop 'length'
    end
    
    it 'should check that a property has a specific value'
      'foo'.should.have_prop 'length', 3
      { length : 3 }.should.have_prop 'length', 3
    end
    
    it 'should check object hashes'
      { foo : 1..3 }.should.have_prop 'foo',  1..3
    end
    
    it 'should fail when the property does not exist'
      'foo'.should.not.have_prop 'foo'
      'foo'.should.not.have_prop 'foo', 'bar'
    end
    
    it 'should fail when it is a function'
      'foo'.should.not.have_prop 'toString'
    end
  end
  
  describe 'have_property'
    it 'should check if a property exists'
      'foo'.should.have_property 'length'
    end
    
    it 'should check that a property has a specific value'
      'foo'.should.have_property 'length', 3
      { length : '3' }.should.not.have_property 'length', 3
    end
    
    it 'should fail when the property does not exist'
      'foo'.should.not.have_property 'foo'
      'foo'.should.not.have_property 'foo', 'bar'
    end
    
    it 'should fail when it is a function'
      'foo'.should.not.have_property 'toString'
    end
  end
  
  describe 'respond_to'
    it 'should check if an object contains a method'
      'test'.should.respond_to('toString')
      'test'.should.not.respond_to('rawr')
    end
  end
  
  describe 'include'
    it 'should check if an object includes a property'
      { hey : 'there' }.should.include 'hey'
      { hey : 'there' }.should.not.include 'foo'
    end
    
    it 'should check if a regular expression includes a string'
      (/(foo)?bar/).should.include '(foo)'
    end
    
    it 'should check if a string contains a substring'
      'if (foo) return [foo, bar]'.should.include '[foo, bar'
    end
    
    it 'should check if a function body includes a string'
      -{ return [foo, bar] }.should.include 'foo', 'bar'
    end
    
    it 'should check if an array contains element(s)'
      [1,2,3].should.include 1
      [1,2,3].should.include 1, 2, 3
      [1].should.not.include 0
      ['foo', 'bar'].should.include 'foo', 'bar'
      ['foo', 'bar'].should.include 'bar', 'foo'
      ['foo', 'bar'].should.not.include 'foo', 'rawr'
      ['foo', 'bar'].should.not.include 'rawr', 'foo'
    end
    
    it 'should check hashes of array elements'
      [1, [2]].should.include [2]
      [1, [2]].should.include [2], 1
      [1, { two : 'three' }].should.include { two : 'three' } 
    end
  end
  
  describe 'be_a'
    it 'should compare the constructor of an object'
      'test'.should.be_a String
      [].should.be_an Array
    end
  end

  describe 'throw_error'
    it 'should check if an error is thrown'
      -{ throw 'error' }.should.throw_error
      -{ return 'test' }.should.not.throw_error
    end
    
    it 'should check if an error with a specific message is thrown'
      -{ throw 'some foo bar' }.should.throw_error('some foo bar')
      -{ throw 'some foo bar' }.should.throw_error(/foo bar/)
      -{ throw 'some foo bar' }.should.not.throw_error(/rawr/)
      -{ throw 'some foo bar' }.should.not.throw_error('rawr')
    end
    
    it 'should check if an error of a specific constructor is thrown'
      function CustomError() {}
      CustomError.name = "CustomError"
      -{ throw new Error('foo') }.should.throw_error(Error)
      -{ throw new CustomError('foo') }.should.throw_error(CustomError)
      -{ throw 'foo' }.should.not.throw_error CustomError
      -{ throw new CustomError('foo') }.should.not.throw_error Error
    end
    
    it 'should check if an error with a specific constructor and message is thrown'
      Error.name = "Error"
      function CustomError(message) { this.message = message }
      CustomError.name = "CustomError"
      CustomError.prototype.toString = function(){ return 'CustomError: ' + this.message }
      -{ throw new CustomError('oh no!') }.should.throw_error(CustomError, 'oh no!')
      -{ throw new CustomError('oh no!') }.should.not.throw_error(CustomError, 'foo bar')
      -{ throw new CustomError('oh no!') }.should.throw_error(CustomError, /oh no/)
      -{ throw new CustomError('oh no!') }.should.not.throw_error(CustomError, /foo bar/)
      -{ throw new CustomError('oh no!') }.should.not.throw_error(Error, 'oh no!')
      -{ throw new CustomError('oh no!') }.should.not.throw_error(Error, 'foo bar')
    end
  end
  
  describe 'be_an_instance_of'
    it 'should check that an object is an instance of another'
      MyObject = function(){}
      myInstance = new MyObject()
      {}.should.be_an_instance_of Object
      [].should.be_an_instance_of Array
      MyObject.should.be_an_instance_of Function
      myInstance.should.be_an_instance_of MyObject
      myInstance.should.be_an_instance_of Object
    end
  end
  
  describe 'be_type'
    it 'should compare the type of an object via typeof'
      'hey'.should.be_type 'string'
      {}.should.be_type 'object'
    end
  end

  describe 'be_within'
    it 'should check if a number is within a range'
      5.should.be_within 1..10
      15.should.not.be_within 10..5
    end
  end
  
  describe 'have'
    it 'should check the length of a property'
      person = { pets : ['izzy', 'niko'] }
      person.should.have 2, 'pets'
      person.should.not.have 3, 'pets'
    end
  end
  
  describe 'have_at_least'
    it 'should check if a object has at least n of a property'
      person = { pets : ['izzy', 'niko'] }
      person.should.have_at_least 1, 'pets'
      person.should.have_at_least 2, 'pets'
      person.should.not.have_at_least 3, 'pets'
    end
  end
  
  describe 'have_at_most'
    it 'should check if an object has at most n of a property'
      person = { pets : ['izzy', 'niko'] }
      person.should.have_at_most 2, 'pets'
      person.should.have_at_most 3, 'pets'
      person.should.not.have_at_most 1, 'pets'
    end
  end
  
  describe 'receive'
    before_each
      person = { toString : function(){ return 'person' }}
      personWithPets = {
        toString : function(){ return 'personWithPets'    },
        getPets  : function()     { return ['izzy']       },
        addPet   : function(name) { return ['izzy', name] },
        addPets  : function(a, b) { return ['izzy', a, b] }
      }
    end
    
    it 'should pass when the method is invoked'
      personWithPets.should.receive('getPets')
      personWithPets.getPets()
    end
    
    it 'should pass and original method should still return its result'
      personWithPets.should.receive('getPets')
      personWithPets.getPets().should.eql ['izzy']
    end
    
    it 'should pass when the proper value is returned'
      personWithPets.should.receive('getPets').and_return(['izzy'])
      personWithPets.getPets()
    end
    
    it 'should pass when invoked the expected number of times'
      personWithPets.should.receive('getPets', 'twice').and_return(['izzy'])
      personWithPets.getPets()
      personWithPets.getPets()
    end
    
    it 'should pass when a method is invoked with specific arguments'
      personWithPets.should.receive('addPet', 'once').with_args('suki')
      personWithPets.addPet('suki')
    end
    
    it 'should pass with multiple arguments'
      personWithPets.should.receive('addPets').with_args('suki', 'max')
      personWithPets.addPets('suki', 'max')
    end
    
    it 'should pass with arguments and return value'
      personWithPets.should.receive('addPet').with_args('suki').and_return(['izzy', 'suki'])
      personWithPets.addPet('suki')
    end 
     
    it 'should pass when argument is the correct type'
      personWithPets.should.receive('addPet').with_args(an_instance_of(String))
      personWithPets.addPet('suki')
    end
    
    it 'should pass when return type is correct'
      personWithPets.should.receive('addPet').and_return(an_instance_of(Array))
      personWithPets.addPet('suki')
    end
    
    it 'should pass when checking the type of multiple args and return types'
      personWithPets.should.receive('addPets').with_args(an_instance_of(String), an_instance_of(String)).and_return(an_instance_of(Array))
      personWithPets.addPets('suki', 'max')
    end
    
    it 'should pass with negation when a method is not called'
      personWithPets.should.not.receive('addPets')
    end
    
    it 'should pass with negation with args'
      personWithPets.should.not.receive('addPets').with_args('izzy')
      personWithPets.addPets('max')
    end
    
    it 'should pass with negation with return values'
      personWithPets.should.not.receive('addPets').with_args('izzy').and_return('test')
      personWithPets.addPets('izzy')
    end
    
    it 'should pass with negation with times'
      personWithPets.should.not.receive('addPets', 'twice')
      personWithPets.addPets('izzy')
    end
    
    it 'should pass with boolean args'
      foo = { bar : function(arg){ return arg }}
      foo.should.receive('bar', 'twice').with_args(true)
      foo.bar(true)
      foo.bar(true)
    end
    
    it 'should pass with null args'
      foo = { bar : function(arg){ return arg }}
      foo.should.receive('bar').with_args(null)
      foo.bar(null)
    end
    
    it 'should pass with boolean return value true'
      foo = { bar : function(){ return true }}
      foo.should.receive('bar').and_return(true)
      foo.bar()
    end
    
    it 'should pass with boolean return value false'
      foo = { bar : function(){ return false }}
      foo.should.receive('bar').and_return(false)
      foo.bar()
    end
    
    it 'should pass with null return value'
      foo = { bar : function(){ return null }}
      foo.should.receive('bar').and_return(null)
      foo.bar()
    end
                                     
    it 'should fail when the method does not exist'
      spec = mock_it(function(){
        person.should.receive('getPets')
      })
      spec.should.have_failure_message('expected person.getPets() to be called once, but  was not called')
    end
    
    it 'should fail when the method is never invoked'
      spec = mock_it(function(){
        personWithPets.should.receive('getPets')
      })
      spec.should.have_failure_message('expected personWithPets.getPets() to be called once, but  was not called')
    end
    
    it 'should fail when improper value is returned'
      spec = mock_it(function(){
        personWithPets.should.receive('getPets').and_return(['niko'])
        personWithPets.getPets()
      })
      spec.should.have_failure_message('expected personWithPets.getPets() to return [ "niko" ] but got [ "izzy" ]')
    end
    
    it 'should fail when checking the type of multiple args and return types'
      spec = mock_it(function(){
        personWithPets.should.receive('addPets').with_args(an_instance_of(String), an_instance_of(Array)).and_return(an_instance_of(Array))
        personWithPets.addPets('suki', 'max')
      })
      spec.should.have_failure_message('expected personWithPets.addPets() to be called with an instance of String, an instance of Array but was called with "suki", "max"')
    end
        
    it 'should fail when not invoked the expected number of times'
      spec = mock_it(function(){
        personWithPets.should.receive('getPets', 'twice').and_return(['izzy'])
        personWithPets.getPets()
      })
      spec.should.have_failure_message('expected personWithPets.getPets() to be called twice, but  was called once')
    end
    
    it 'should fail when not invoked many times'
      spec = mock_it(function(){
        personWithPets.should.receive('getPets', 3).and_return(['izzy'])
        personWithPets.getPets()
        personWithPets.getPets()
      })
      spec.should.have_failure_message('expected personWithPets.getPets() to be called 3 times, but  was called twice')
    end
    
    it 'should fail when not invoked with specific arguments'
      spec = mock_it(function(){
        personWithPets.should.receive('addPet', 'once').with_args('suki')
        personWithPets.addPet('niko')
      })
      spec.should.have_failure_message('expected personWithPets.addPet() to be called with "suki" but was called with "niko"')
    end
    
    it 'should fail when expecting multiple arguments'
      spec = mock_it(function(){
        personWithPets.should.receive('addPets').with_args('suki', 'max')
        personWithPets.addPets('suki')
      })
      spec.should.have_failure_message('expected personWithPets.addPets() to be called with "suki", "max" but was called with "suki"')
    end
    
    it 'should fail when argument is of the wrong type'
      spec = mock_it(function(){
        personWithPets.should.receive('addPet').with_args(an_instance_of(String))
        personWithPets.addPet(['suki'])
      })
      spec.should.have_failure_message('expected personWithPets.addPet() to be called with an instance of String but was called with [ "suki" ]')
    end
    
    it 'should fail when return type is incorrect'
      spec = mock_it(function(){
        personWithPets.should.receive('addPet').and_return(an_instance_of(String))
        personWithPets.addPet('suki')
      })
      spec.should.have_failure_message('expected personWithPets.addPet() to return an instance of String but got [ "izzy", "suki" ]')
    end
        
    it 'should fail with negation when a method is called'
      spec = mock_it(function(){
        personWithPets.should.not.receive('addPets')
        personWithPets.addPets('izzy')
      })
      spec.should.have_failure_message('expected personWithPets.addPets() not to be called once, but  was called once')
    end

    it 'should fail with negation with args'
      spec = mock_it(function(){
        personWithPets.should.not.receive('addPets').with_args('izzy')
        personWithPets.addPets('izzy')
      })
      spec.should.have_failure_message('expected personWithPets.addPets() not to be called with "izzy" but was')
    end
    
    it 'should fail with negation with return values'
      spec = mock_it(function(){
        personWithPets.should.not.receive('addPets').with_args('izzy').and_return(an_instance_of(Array))
        personWithPets.addPets('izzy')
      })
      spec.should.have_failure_message('expected personWithPets.addPets() not to return an instance of Array but it did')
    end
    
    it 'should fail with negation when called once with no times specified'
      spec = mock_it(function(){
        personWithPets.should.not.receive('addPets')
        personWithPets.addPets('izzy')
      })
      spec.should.have_failure_message('expected personWithPets.addPets() not to be called once, but  was called once')
    end
    
    it 'should fail with negation when called more than once with no times specified'
      spec = mock_it(function(){
        personWithPets.should.not.receive('addPets')
        personWithPets.addPets('izzy')
        personWithPets.addPets('izzy')
      })
      spec.should.have_failure_message('expected personWithPets.addPets() not to be called once, but  was called twice')
    end
        
    it 'should fail with negation when called more than the times specified'
      spec = mock_it(function(){
        personWithPets.should.not.receive('addPets', 3)
        personWithPets.addPets('izzy')
        personWithPets.addPets('izzy')
        personWithPets.addPets('izzy')
        personWithPets.addPets('izzy')
      })
      spec.should.have_failure_message('expected personWithPets.addPets() not to be called 3 times, but  was called 4 times')
    end
    
    it 'should fail with boolean args'
      spec = mock_it(function(){
        foo = { bar : function(arg){ return arg }}
        foo.should.receive('bar').with_args(true)
        foo.bar(false)
      })
      spec.should.have_failure_message('expected [object Object].bar() to be called with true but was called with false')
    end
    
    it 'should fail with boolean return value true'
      spec = mock_it(function(){
        foo = { bar : function(){ return true }}
        foo.should.receive('bar').and_return(false)
        foo.bar()
      })
      spec.should.have_failure_message('expected [object Object].bar() to return false but got true')
    end
    
    it 'should fail with boolean return value false'
      spec = mock_it(function(){
        foo = { bar : function(){ return false }}
        foo.should.receive('bar').and_return(true)
        foo.bar()
      })
      spec.should.have_failure_message('expected [object Object].bar() to return true but got false')
    end
  end
  
end