
describe 'JSpec'
  describe 'Mock XMLHttpRequest'
    before
      responseFrom = function(path) {
        request = new XMLHttpRequest
        request.open('POST', path, false)
        request.send(null)
        return request.responseText
      }
    end
    
    it 'should provide snake DSL methods'
      mock_request.should.equal mockRequest
      unmock_request.should.equal unmockRequest
    end
    
    it 'should mock XMLHttpRequests if unmockRequest() is called or the spec block has finished'
      original = XMLHttpRequest
      mockRequest().and_return('test')
      XMLHttpRequest.should.not.equal original 
      unmockRequest()
      XMLHttpRequest.should.equal original
    end
    
    it 'should restore original XMLHttpRequest constructor after each spec'
      XMLHttpRequest.should.not.eql JSpec.XMLHttpRequest
    end
    
    describe 'last_request()'
      it 'should provide access to the previous request'
        mock_request().and_return('foo')
        responseFrom('async')
        last_request().url.should.eql 'async'
        last_request().status.should.eql 200
      end
    end
    
    describe 'mock_request()'
      before_each
        mockRequest().and_return('bar', 'text/plain', 200, { 'x-foo' : 'bar' })
        request = new XMLHttpRequest
        request.open('GET', 'path', false, 'foo', 'bar')
        request.send('foo=bar')
      end
      
      it 'should allow setting response status'
        mockRequest().and_return('bar', 'text/plain', 404)
        request = new XMLHttpRequest
        request.open('GET', 'path', false)
        request.send(null)
        request.status.should.eql 404
        request.statusText.should.eql 'Not Found'
      end
      
      it 'should default readyState to 0'
        request = new XMLHttpRequest
        request.readyState.should.eql 0
      end
      
      it 'should populate user'
        request.user.should.eql 'foo'
      end
      
      it 'should populate password'
        request.password.should.eql 'bar'
      end

      it 'should populate method'
        request.method.should.eql 'GET'
      end
      
      it 'should populate readyState'
        request.readyState.should.eql 4
      end
      
      it 'should populate url'
        request.url.should.eql 'path'
      end
      
      it 'should populate status'
        request.status.should.eql 200
      end
      
      it 'should populate statusText'
        request.statusText.should.eql 'OK'
      end
      
      it 'should populate content type response header'
        request.getResponseHeader('Content-Type').should.eql 'text/plain'
      end
      
      it 'should populate Content-Length response header'
        request.getResponseHeader('Content-Length').should.eql 3
      end
      
      it 'should populate data'
        request.data.should.eql 'foo=bar'
      end
      
      it 'should populate responseText'
        request.responseText.should.eql 'bar'
      end
      
      it 'should populate headers'
        request.getResponseHeader('X-Foo').should.eql 'bar'
      end
      
      it 'should not interrupt JSpec request related functionality'
        mockRequest().and_return('fail')
        fixture('test').should.eql '<p>test</p>'
        fixture('test.json').should.include '{ user'
      end
      
      describe '.onreadystatechange()'
        before_each
          mockRequest().and_return('bar', 'text/plain', 200)
          request = new XMLHttpRequest
        end
        
        it 'should be called when opening request in context to the request'
          request.onreadystatechange = function(){
            this.readyState.should.eql 1
          }
          request.open('GET', 'path')
        end
        
        it 'should be called when sending request'
          request.open('GET', 'path')
          request.onreadystatechange = function(){
            this.readyState.should.eql 4
          }
          request.send(null)
        end
      end
      
      describe '.setRequestHeader()'
        it 'should set request headers'
          mockRequest().and_return('bar', 'text/plain', 200)
          request.open('GET', 'path', false, 'foo', 'bar')
          request.setRequestHeader('Accept', 'foo')
          request.send(null)
          request.requestHeaders['accept'].should.eql 'foo'
        end
      end
      
      describe 'HEAD'
        it 'should respond with headers only'
          mockRequest().and_return('bar', 'text/plain', 200)
          request.open('HEAD', 'path', false)
          request.send(null)
          request.responseText.should.be_null
        end
      end
    end
  end
end