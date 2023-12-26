Espionage = {
  version: "0.2.0"
};

Espionage.Helpers = function() {
  var clone = function(obj) {
    function F() {}
    F.prototype = obj;
    return new F();
  };

  var hasProperty = function(obj, property) {
    for (p in obj) {
      if (p === property) {
        return true;
      }
    }

    return false;
  };

  // the following is coppied from jQuery

  // See test/unit/core.js for details concerning isFunction.
  // Since version 1.3, DOM methods and functions like alert
  // aren't supported. They return false on IE (#2968).
  var isFunction = function( obj ) {
    return toString.call(obj) === "[object Function]" || obj instanceof Function;
  };

  var grep = function( elems, callback, inv ) {
    var ret = [];

    // Go through the array, only saving the items
    // that pass the validator function
    for ( var i = 0, length = elems.length; i < length; i++ ) {
      if ( !inv !== !callback( elems[ i ], i ) ) {
        ret.push( elems[ i ] );
      }
    }

    return ret;
  };

  var map = function( elems, callback, arg ) {
    var ret = [], value;

    // Go through the array, translating each of the items to their
    // new value (or values).
    for ( var i = 0, length = elems.length; i < length; i++ ) {
      value = callback( elems[ i ], i, arg );

      if ( value != null ) {
        ret[ ret.length ] = value;
      }
    }

    return ret.concat.apply( [], ret );
  };

  var merge = function( first, second ) {
    var i = first.length, j = 0;

    if ( typeof second.length === "number" ) {
      for ( var l = second.length; j < l; j++ ) {
        first[ i++ ] = second[ j ];
      }

    } else {
      while ( second[j] !== undefined ) {
        first[ i++ ] = second[ j++ ];
      }
    }

    first.length = i;

    return first;
  };

  var each = function( object, callback, args ) {
    var name, i = 0,
      length = object.length,
      isObj = length === undefined || isFunction(object);

    if ( args ) {
      if ( isObj ) {
        for ( name in object ) {
          if ( callback.apply( object[ name ], args ) === false ) {
            break;
          }
        }
      } else {
        for ( ; i < length; ) {
          if ( callback.apply( object[ i++ ], args ) === false ) {
            break;
          }
        }
      }

    // A special, fast, case for the most common use of each
    } else {
      if ( isObj ) {
        for ( name in object ) {
          if ( callback.call( object[ name ], name, object[ name ] ) === false ) {
            break;
          }
        }
      } else {
        for ( var value = object[0];
          i < length && callback.call( value, i, value ) !== false; value = object[++i] ) {}
      }
    }

    return object;
  };


  return {
    clone:                clone,
    hasProperty:          hasProperty,
    isFunction:           isFunction,
    grep:                 grep,
    map:                  map,
    each:                 each
  };
}();

Espionage.Stub = function() {
  var stubs        = [],
      current_stub = {},
      each         = Espionage.Helpers.each,
      clone        = Espionage.Helpers.clone,
      hasProperty  = Espionage.Helpers.hasProperty;

  function restoreMethod(stub) {
    var obj        = stub.object,
        message    = stub.methodName,
        definition = stub["function"];

    if (stub.hasProperty) {
      obj[message] = definition;
    } else {
      delete(obj[message]);
    }
  }

  function register() {
    var next_element = stubs.length,
        obj          = current_stub.object,
        method_name  = current_stub.methodName;

    stubs[next_element] = clone(current_stub);
  }

  function restoreEachGlobalStub() {
    each(stubs.reverse(), function(index, stub) {
      restoreMethod(stub);
    });
  }

  function resetGlobalStubs() {
    stubs = [];
  }

  function setValue(value) {
    var obj         = current_stub.object;
    var method_name = current_stub.methodName;

    if (typeof(value) != "function") {
      var return_value = value;
      value = function() { return(return_value); };
    }

    obj[method_name] = value;
  }

  var stub = function(obj, method_name, value) {
    current_stub = {
      "object":      obj,
      "methodName":  method_name,
      "function":    obj[method_name],
      "hasProperty": hasProperty(obj, method_name)
    };

    register();
    setValue(value);
    return this;
  };

  var globalStubs = function() {
    return stubs;
  };

  var tearDown = function() {
    restoreEachGlobalStub();
    resetGlobalStubs();
  };

  return {
    stub:     stub,
    stubs:    globalStubs,
    tearDown: tearDown
  };
}();

Espionage.Spy = function() {
  var intercepted_messages = [],
      isFunction        = Espionage.Helpers.isFunction,
      grep              = Espionage.Helpers.grep,
      map               = Espionage.Helpers.map,
      each              = Espionage.Helpers.each,
      stub              = Espionage.Stub.stub;

  function argsToArray(args) {
    return Array.prototype.slice.call(args);
  }

  function redefineMethod(obj, property) {
    var old_method = obj[property];

    stub(obj, property, function() {
      intercepted_messages[intercepted_messages.length] = {
        object: obj,
        property: property,
        arguments: argsToArray(arguments)
      };
      old_method();
    });
  }

  function redefineEachMethod(obj) {
    for (property in obj) {
      if (isFunction(obj[property])) {
        redefineMethod(obj, property);
      }
    }
  }

  function findAllReceivedMethods(obj, method_name) {
    return grep(intercepted_messages, function(message_pair) {
      return message_pair.object   === obj &&
             message_pair.property === method_name;
    });
  }

  var intercepted = function(obj, method_name, fun) {
    var calls = findAllReceivedMethods(obj, method_name);

    if (calls.length <= 0) {
      var e = new Error("expected " + method_name + " but never got it");
      e.name = "MockExpectationError";
      throw e;
    }

    if (fun) {
      each(calls, function() {
        fun.apply(obj, this.arguments);
      });
    }

    return true;
  };

  var spyOn = function(obj, fun) {
    redefineEachMethod(obj);
    fun.call();
  };

  var tearDown = function(obj) {
    intercepted_messages = [];
  };

  return {
    spyOn:       spyOn,
    intercepted: intercepted,
    tearDown:    tearDown
  };
}();

Espionage.stub        = Espionage.Stub.stub;
Espionage.intercepted = Espionage.Spy.intercepted;
Espionage.spyOn       = Espionage.Spy.spyOn;

Espionage.tearDown = function() {
  Espionage.Stub.tearDown();
  Espionage.Spy.tearDown();
};
