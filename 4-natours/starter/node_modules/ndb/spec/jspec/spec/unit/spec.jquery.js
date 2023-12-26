
describe 'jQuery'
  describe 'puts()'
    it 'should output selector when present'
      object = { jquery: '1.3.2', selector: '.foo bar' }
      puts(object).should.eql 'selector ".foo bar"'
    end
    
    it 'should output outerHTML otherwise'
      puts($('<p>Foo</p>')).should.match(/<p>Foo<\/p>/i)
    end
  end
  
  describe 'with elements'
    it 'should output the outerHTML'
      puts($('<p>Foo</p>').get(0)).should.match(/<p>Foo<\/p>/i)
    end
  end
  
  describe 'sandbox()'
    before
      dom = sandbox()
    end
    
    it 'should provide an empty DOM sandbox'
      dom.prepend('<em>test</em>')
      dom.should.have_text 'test'
    end
  end

  describe 'element() / elements()'
    it 'should alias jQuery'
      element.should.be jQuery
      elements.should.be jQuery
    end
  end
  
  describe 'matchers'
    before_each
      html = '<p><label><em>Save?</em></label>                 \
      <select class="save form-select" style="display: none;"> \
      <option value="0">No</option>                            \
      <option value="1">Yes</option>                           \
      </select>                                                \
      <strong>test</strong>                                    \
      <strong>test</strong>                                    \
      </p>'
      elem = $(html)
    end

    it 'should fail with pretty print of element'
      spec = mock_it(function() {
        elem.should.not.have_tag 'label'
      })
      spec.should.have_failure_message(/<label>\s*<em>Save?/i)
    end
    
    describe 'have_tag / have_one'
      it 'should check if a single child is present'
        elem.should.have_tag 'label'
        elem.should.have_tag 'em'
        elem.should.have_one 'label'
        elem.should.not.have_tag 'input'
      end
    end

    describe 'have_tags / have_many / have_any'
      it 'should check if more than one child is present'
        elem.should.have_tags 'option'
        elem.should.have_many 'option'
        elem.should.not.have_many 'label'
        elem.find('option').remove()
        elem.should.not.have_any 'option'
      end
    end

    describe 'have_child'
      it 'should check if a direct child is present'
        elem.should.have_child 'label'
        elem.should.not.have_child 'em'
      end
    end

    describe 'have_children'
      it 'should check if more than one direct children are present'
        elem.should.have_children 'strong'
        elem.should.not.have_children 'select'
      end
    end
    
    describe 'have_text'
      it 'should check for plain text'
        $('label', elem).should.have_text 'Save?'
      end
    end
    
    describe 'have_value'
      it 'should check if an element has the given value'
        elem.find('option').get(1).should.have_value '1'  
      end
    end

    describe 'have_class'
      it 'should check if an element has the given class'
        $('select', elem).should.have_class 'save'
      end
    end
    
    describe 'have_classes'
      it 'should check if an element has the classes given'
        $('select', elem).should.have_classes 'save', 'form-select'
        $('select', elem).should.not.have_classes 'save', 'foo'
        $('select', elem).should.not.have_classes 'foo', 'save'
      end
    end
    
    describe 'have_event_handlers'
      it 'should check if an element has handlers for a given event'
        elem.should.not.have_event_handlers 'click'
        elem.bind('click', function(){})
        elem.should.have_event_handlers 'click'
      end
    end

    describe 'be_visible'
      it 'should check that an element is not hidden or set to display of none'
        element('#jspec-report').should.be_visible
        '#jspec-report'.should.be_visible
        '<input style="visibility: hidden;"/>'.should.not.be_visible
        '<input style="display: none;"/>'.should.not.be_visible
        '<input />'.should.be_visible
      end
    end
    
    describe 'be_enabled'
      it 'should check that an element is currently enabled'
        '<input type="button"/>'.should.be_enabled
        '<input type="button" disabled="disabled" />'.should.not.be_enabled
      end
    end
    
    describe 'be_BOOLATTR'
      it 'should check that an element is currently selected, disabled, checked etc'
        '<input type="button"/>'.should.not.be_disabled
        '<input type="button" disabled="disabled" />'.should.be_disabled
        '<option value="foo" selected="selected">Foo</option>'.should.be_selected
      end
    end
    
    describe 'be_animated'            
      it 'should check if an element is currently animated'
        elem.should.not.be_animated
        elem.fadeIn(1000)
        elem.should.be_animated
      end
    end
    
    describe 'have_ATTR'
      it 'should check if an attribute exists'
        '<input type="checkbox"/>'.should.have_type
      end
      
      it 'should check if an attribute has a specific value'
        '<input type="checkbox"/>'.should.have_type 'checkbox'
      end
    end
    
    describe 'be_hidden'
      it 'should check if an element is hidden'
        '<input style="display: none;" />'.should.be_hidden
        '<input style="visibility: hidden;" />'.should.be_hidden
        '<input />'.should.not.be_hidden
      end
    end

    describe 'have_attr'
      before_each 
        elem = '<input type="button" title="some foo" value="Foo" />' 
      end
      
      it 'should check that an element has the given attribute'
        elem.should.have_attr 'title'
        elem.should.not_have_attr 'rawr'
      end
      
      it 'should check that the given attribute has a specific value'
        elem.should.have_attr 'title', 'some foo'
        elem.should.not.have_attr 'some', 'rawr'
        elem.should.not.have_attr 'title', 'bar'
      end
    end
  end
  
end