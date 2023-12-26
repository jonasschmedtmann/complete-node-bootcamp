
describe 'jQuery'
  describe '.ajax()'
    it "should call the success function when 200"
      mock_request().and_return('{ foo: "bar" }', 'application/json')
      var successCalled = false
      var errorCalled = false
      $.ajax({
        type: "POST",
        url: 'foo',
        dataType: 'json',
        success: function() {
          successCalled = true
        },
        error: function(xhr, status, e) {
          errorCalled = true
        }
      })
      successCalled.should.be_true
      errorCalled.should.be_false
    end
    
    it "should call the error function when 404"
      mock_request().and_return('{ foo: "bar" }', 'application/json', 404)
      var successCalled = false
      var errorCalled = false
      $.ajax({
        type: "POST",
        url: 'foo',
        dataType: 'json',
        success: function() {
          successCalled = true
        },
        error: function() {
          errorCalled = true
        }
      })
      successCalled.should.be_false
      errorCalled.should.be_true
    end
  end
  
  it 'should work with getScript()'
    mock_request().and_return('var foo = "bar"', 'application/javascript', 200)
    var called = false
    $.getScript('foobar', function(data, textStatus){
      called = true
    })
    called.should.be_true
  end
  
  describe '.getJSON()'
    it 'should work with mockRequest'
      mockRequest().and_return('{ foo : "bar" }')
      $.getJSON('foo', function(response, statusText){
        response.foo.should.eql 'bar'
        statusText.should.eql 'success'
      })
    end
    
    it 'should work with a json fixture'
      mockRequest().and_return(fixture('test.json'))
      $.getJSON('foo', function(response){
        response.users.tj.email.should.eql 'tj@vision-media.ca'
      })
    end
    
    it 'should not invoke callback when response status is 4xx'
      mockRequest().and_return('foo', 'text/plain', 404)
      $.getJSON('foo', function(){
        fail('callback was invoked')
      })
    end
  end
  
  describe '.post()'
    it 'should work with mockRequest'
      mockRequest().and_return('<p></p>', 'text/html')
      $.post('foo', function(response){
        response.should.eql '<p></p>'
      })
    end
  end
end