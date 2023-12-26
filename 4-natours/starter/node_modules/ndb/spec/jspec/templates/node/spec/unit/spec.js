
describe 'YourLib'
  describe '.version'
    it 'should be a triplet'
      yourlib.version.should.match(/^\d+\.\d+\.\d+$/)
    end
  end
end