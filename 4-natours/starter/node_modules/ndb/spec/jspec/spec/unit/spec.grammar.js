describe 'Grammar'
  it 'should allow "it" spec literal'
    true.should.be_true
  end
  
  n = 10
  
  it 'should allow literal javascript outside of blocks'
    n.should.eql 10
  end

  it 'should escape <html> in <p>descriptions</p> and body'
    '<p></p>'.should.eql '<p></p>'
  end
  
  it 'should parse correctly when "it" is within the body'
    text = 'Get it at Github'
    text.should.include 'it'
  end
  
  it 'should parse correctly when "describe" is within the body'
    text = 'It should work with describe'
    text.should.include 'describe'
  end
  
  it 'should parse correctly when "end" is within the body'
    text = 'This should not end the parsing :)'
    text.should.include 'not'
  end
  
  it 'should parse correctly with "before" and "after" within the body'
    text = 'This comes before that, which is after the rest'
    text.should.include 'before'
  end
  
  it 'should allow parens to be optional when no args are passed'
    true.should.be_true
    true.should.be_true()
  end
  
  it 'should not mess up with words like it or append in descriptions'
    -{ element.append().end() }.should.throw_error
  end
  
  it 'should not mess up "end" in strings'
    'foo end bar'.should.not.eql 'foo }); bar'
  end
  
  it 'should allow semicolons'
    true.should.be_true;
    true.should.be_true();
    true.should.be_true() ;
  end
  
  it 'should allow parens to be optional with args'
    'foobar'.should.include 'foo'
    'rawr'.should.not_include 'foo'
  end
  
  it 'should allow literals without defining variables variables'
    {}.should.be_an Object
  end
  
  it 'should allow alternative closure literal'
    -{ throw 'test' }.should.throw_error
  end
  
  it 'should allow grammar-less assertions'
    expect(true).to(be, true)
    expect([1,2,3]).to(include, 1, 2, 3)
    expect(true).not_to(be, false)
  end
  
  it 'should allow multi-line expect() assertions'
    expect(' \
foo \
bar \
').to(include, 'foo', 'bar')
  end
  
  it 'should allow commenting out of conversions'
    // -{ throw 'foo' }.should.throw_error
    // foo.should.not.eql 'bar'
  end
  
  it 'should allow inclusive range literal n..n'
    1..5.should.eql [1,2,3,4,5]
    3..4.should.eql [3,4]
    1..1.should.eql [1]
    3..1.should.eql [3,2,1]
  end
  
  it 'should allow snakecase style assertions'
    'foo'.should_equal('foo')
    'foo'.should_equal 'foo'
    'bar'.should_not_equal('foo')
    'bar'.should_not_equal 'foo'
  end
  
  it 'should allow dot style assertions'
    'foo'.should.equal('foo')
    'foo'.should.equal 'foo'
    'bar'.should.not.equal('foo')
    'bar'.should.not.equal 'foo'
  end
  
describe 'with tabs'
before_each
foo = 'bar'
end
 
it 'should work'
foo.should.eql 'bar'
end
 
it 'should work'
true.should.be true
true.should.be(true)
true.should.be(true);
end
end
  
  describe 'with nested describe'
    it 'should work'
      true.should.be_true
    end
    
    describe 'nested again'
      it 'should still work'
        true.should.be_true
      end
    end
  end
  
  describe 'before / after blocks'
    before
      n = 1
      hits = []
      hits.push('before')
    end
    
    after
      n = 0
      hits.push('after')
    end
    
    it 'should work'
      n.should.eql 1
      hits.should.eql ['before']
      n++
    end
    
    it 'should persist'
      n.should.eql 2
      hits.should.eql ['before']
    end
    
    describe 'with nested describe'
      it 'variables should be accessable'
        n.should.eql 2
      end

			it 'should only run for outer describe'
        hits.should.eql ['before']
			end
    end
  end
  
  describe 'before_nested / after_nested blocks'
    before
			x = 0
			y = 0
		end

		before_nested
      x++
    end
    
    after_nested
      y++
    end
    
    it 'should execute before_nested before suite'
      x.should.eql 1
    end
       
    describe 'with nested describe'
      it 'should execute before_nested before nested suite'
        x.should.eql 2
      end
		end
		
		describe 'after_nested'
			it 'should execute after_nested after nested suite'
				y.should.eql 1
			end
		end
  end

  describe 'before_each / after_each blocks'
    before
			hits = []
		end
    
    before_each
      n = 1
      hits.push('before_each')
    end
    
    after_each
      o = 2
      hits.push('after_each')
    end
    
    it 'should work'
      n.should.eql 1
      hits.should.eql ['before_each']
      n = 2
    end
    
    it 'should not persist'
      n.should.eql 1
      o.should.eql 2
      hits.should.eql ['before_each', 'after_each', 'before_each']
    end
    
    describe 'with nested describe'
      it 'should be accessable'
        n.should.eql 1
        o.should.eql 2
        hits.should.eql ['before_each', 'after_each', 'before_each', 'after_each', 'before_each']
      end
      
      it 'should continue hits'
        hits.should.eql ['before_each', 'after_each', 'before_each', 'after_each', 'before_each', 'after_each', 'before_each']
      end
      
      describe 'with more hooks'
        before_each
          hits.push('before_each')
        end
        
        after_each
          hits.push('after_each')
        end
        
        it 'should continue hits, while cascading properly'
          hits.should.eql ['before_each', 'after_each', 'before_each', 'after_each', 'before_each', 'after_each', 'before_each', 'after_each', 'before_each', 'before_each']
        end
      end
      
      describe 'with multiple hooks'
        before_each
          hits = []
        end
        
        before_each
          hits.push('before_each')
        end
        
        it 'should work'
          hits.should.eql ['before_each']
        end
      end
    end
  end
  
end
 
__END__
 
this should not matter because it is
considered a comment by the JSpec grammar :)
and is sometimes useful for temp reference info
when writting specs.
