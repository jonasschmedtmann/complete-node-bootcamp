
describe 'node'
  describe 'matchers'
    describe 'have_enumerable_property'
      it 'should check if a property is enumerable'
        { foo: 'bar' }.should.have_enumerable_property 'foo'
        var o = {}
        Object.defineProperty(o, 'foo', { value: 'bar', enumerable: false })
        o.should.not.have_enumerable_property 'bar'
      end
    end
    
    describe 'have_writable_property'
      it 'should check if a property is writable'
        { foo: 'bar' }.should.have_writable_property 'foo'
        var o = {}
        Object.defineProperty(o, 'foo', { value: 'bar', writable: false })
        o.should.not.have_writable_property 'foo'
      end
    end
    
    describe 'have_configurable_property'
      it 'should check if a property is configurable'
        { foo: 'bar' }.should.have_configurable_property 'foo'
        var o = {}
        Object.defineProperty(o, 'foo', { value: 'bar', configurable: false })
        o.should.not.have_configurable_property 'foo'
      end
    end
    
    describe 'have_keys'
      it 'should check if keys match'
        { foo: 'bar' }.should.have_keys ['foo']
        { bar: 'baz' }.should.not.have_keys ['foo']
      end
    end
    
    describe 'have_prototype'
      [].should.have_prototype Array.prototype
      {}.should.not.have_prototype Array.prototype
      {}.should.have_prototype Object.prototype
    end
    
  end
end