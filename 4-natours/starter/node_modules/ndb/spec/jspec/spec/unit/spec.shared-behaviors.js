shared_behaviors_for 'animal'	
	before
		animal = { eats: function(){ return true } }
	end
	
	it 'should eat'
		animal.eats().should.eql true 
	end
end

shared_behaviors_for 'canine'
	should_behave_like('animal')

	before
		animal.hasFourLegs = function(){ return true }
		animal.barks = function(){ return true }
	end

	it 'should have 4 legs'
		animal.hasFourLegs().should.eql true
	end
	
	it 'should bark'
		animal.barks().should.eql true
	end
end

describe 'mastif'
	should_behave_like('canine')

	before
		animal.weight = 200
	end

	it 'should weigh > 100 lbs'
		animal.weight.should.be_greater_than 100
	end	
end

describe 'poodle breeds'
	should_behave_like('canine')
	
	shared_behaviors_for 'poodle'
		before
			animal.isMean = true
		end

		it 'should be mean'
			animal.isMean.should.eql true
		end
	end
	
	describe 'fancy poodle'
		should_behave_like('poodle')
		
		before
			animal.looksRidiculous = true
		end
		
		it 'should look ridiculous'
			animal.looksRidiculous.should.eql true
		end
	end
end

describe 'shared behaviors'
	before
		before_sequence = []
		before_each_sequence = []
		after_sequence = []
		after_each_sequence = []
	end
	
	shared_behaviors_for 'A'
		before
			before_sequence.push('A')
		end
			
		after
			after_sequence.push('A')
		end

		before_each
			before_each_sequence.push('A')
		end
			
		after_each
			after_each_sequence.push('A')
		end		
	end
	
	shared_behaviors_for 'B'
		before
			before_sequence.push('B')
		end
			
		after
			after_sequence.push('B')
		end		
		
		before_each
			before_each_sequence.push('B')
		end
			
		after_each
			after_each_sequence.push('B')
		end		
	end

	describe 'before ordering'
		should_behave_like('B')

		before
			before_sequence.push('C')
		end

		should_behave_like('A')
						
		after 
			after_sequence.push('C')
		end
	
		before_each
			before_each_sequence.push('C')
		end
			
		after_each
			after_each_sequence.push('C')
		end
				
		it "should sequence befores in include order"
			before_sequence.should.eql ['B', 'C', 'A']
		end

		it "should sequence before_eachs in include order"
			before_each_sequence.should.eql ['B', 'A', 'C', 'B', 'A', 'C']
		end		
	end
	
	describe 'after ordering'
		it "should sequence afters in include order"
			after_sequence.should.eql ['B', 'A', 'C']
		end
	
		it "should sequence after_eachs in include order"
			after_each_sequence.should.eql ['B', 'A', 'C', 'B', 'A', 'C']		
		end	
	end
end

shared_behaviors_for 'person'
  it 'should have a name'
    person.should.have_property 'name'
  end
end

shared_behaviors_for 'administrator'
	should_behave_like('person')
	
	it 'should have access to all permissions'
		person.may('edit pages').should.be_true
		person.may('delete users').should.be_true
  end
end

describe 'Shared Behaviors'
  describe 'User'
    before
      User = function(name) { this.name = name }
      person = new User('joe')
    end
    
		should_behave_like('person')  		
  end

  describe 'Administrator' 
    before
      Admin = function(name) { this.name = name }
      Admin.prototype.may = function(perm){ return true }
      person = new Admin('tj')
    end

		should_behave_like('administrator')
  end

  describe 'Super Administrator'
    before
      SuperAdmin = function(name) { this.name = name }
      SuperAdmin.prototype.may = function(perm){ return true }
	  	SuperAdmin.prototype.canCreateUsers = function(){ return true }
      person = new SuperAdmin('tj')
    end

    should_behave_like('administrator')

		it "should be allowed to create users"
		  person.canCreateUsers().should.be_true
		end
  end
  
  shared_behaviors_for 'User with toString()'
    before
      person = { toString : function() { return '<User tj>' }}
    end
    
    it 'should return &lt;User NAME&gt;'
      person.toString().should.match(/\<User/)
    end
  end
  
  describe 'Manager'
    should_behave_like('person')
    should_behave_like('User with toString()')
    
    before
      Manager = function(name) { this.name = name }
      Manager.prototype.may = function(perm){ return perm == 'hire' || perm == 'fire' }
      Manager.prototype.toString = function(){ return '<User ' + this.name + '>' }
      person = new Manager('tj')
    end
    
    it 'should have access to hire or fire employees'
      person.may('hire').should.be_true
      person.may('fire').should.be_true
      person.may('do anything else').should.be_false
    end
  end
  
	describe 'findLocalSharedBehavior'
		it 'should find shared behavior by name'
			JSpec.findLocalSharedBehavior('User with toString()').should.be_a JSpec.Suite
		end
		
    it 'should return null when not found'
      JSpec.findGlobalSharedBehavior('Rawr').should.be_null
    end		

		describe 'nested'
			it 'should find shared behavior by name when nested'
				JSpec.findLocalSharedBehavior('User with toString()').should.be_a JSpec.Suite			
			end
		end
	end

	describe 'findGlobalSharedBehavior'
		it 'should find shared behavior by name'
			JSpec.findGlobalSharedBehavior('person').should.be_a JSpec.Suite
		end
		
    it 'should return null when not found'
      JSpec.findGlobalSharedBehavior('Rawr').should.be_null
    end		
	end
	
	describe 'findSharedBehavior'
		shared_behaviors_for 'person'
			it 'should not have name'
				person.should.not.have_property 'name'
			end
		end
		
		describe 'override behavior'
			it 'should find local shared behavior before global'
				JSpec.findSharedBehavior('person').body.toString().should.match(/should not have name/)
			end
		end
		
		it 'should find shared global behavior by name'
			JSpec.findGlobalSharedBehavior('animal').should.be_a JSpec.Suite
		end
	
    it 'should return null when not found at either level'
      JSpec.findGlobalSharedBehavior('Rawr').should.be_null
    end
	end
end



