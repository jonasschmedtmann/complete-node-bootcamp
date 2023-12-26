
JSpec.include({
  name: 'Helpers',
  utilities : {
    mock_it : function(body) {
      JSpec.assert = false
      var spec = new JSpec.Spec('mock', body)
      var prev = JSpec.currentSpec
      JSpec.runSpec(spec)
      JSpec.currentSpec = prev
      JSpec.assert = true
      return spec
    }
  },
  
  matchers : {
    have_failure_message : function(spec, expected) {
      return JSpec.any(spec.assertions, function(assertion){
        if (assertion.passed) return
        switch (expected.constructor) {
          case String: return assertion.message == expected
          case RegExp: return expected.test(assertion.message)
          default    : return false
        }
      })
    }
  }
})

JSpec.include({
  name: 'ExampleModule',
  utilities : {
    doFoo : function(){ return 'foo' },
    doBar : function(){ return 'bar' }
  },
  randomHook : function(a, b) {
    return [a, b]
  },
  beforeSpec  : function() { addedBeforeSpec  = true; this.utilities.doFoo()  },
  afterSpec   : function() { addedAfterSpec   = true  },
  beforeSuite : function() { addedBeforeSuite = true  },
  afterSuite  : function() { addedAfterSuite  = true  },
  matchers : {
    be_foo_bar : function() {
      return true
    }
  },
  DSLs : {
    snake : {
      some_snake_case_stuff : function(){
        return true
      }
    },
    camel : {
      someCamelCaseStuff : function() {
        return true
      }
    }
  }
})

JSpec.include({
  name : 'EmptyModule'
})