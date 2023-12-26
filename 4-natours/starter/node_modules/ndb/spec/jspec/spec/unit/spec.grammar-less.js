
JSpec.describe('Grammar-less', function(){
  before(function(){
    n = 1
  })
  
  it('should work', function(){
    expect(true).to(be, true)
    expect(n).to(equal, 1)
  })
  
  describe('with nested describes', function(){
    before(function(){
      hits = []
    })
    
    before_each(function(){
      n++
      hits.push('before_each')
    })
    
    it('should work', function(){
      expect(true).not_to(be, false)
      expect(n).to(eql, 2)
      expect(hits).to(eql, ['before_each'])
    })
    
    it('should work again', function(){
      expect(n).to(eql, 3)
      expect(hits).to(eql, ['before_each', 'before_each'])
    })
  })
  
})