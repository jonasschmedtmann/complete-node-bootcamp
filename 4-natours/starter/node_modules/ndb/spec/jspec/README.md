
# JSpec

JSpec is a minimalistic JavaScript behavior driven development framework,
providing **simple installation**, extremely **low learning curve**, absolutely **no pollution**
to core prototypes, async request support, and incredibly sexy syntax, tons of matchers
and **much more**.

## Features

  * Highly readable
  * Framework / DOM independent
  * Modular via JSpec Module's and hooks
  * Mock Ajax Requests
  * Rhino support
  * Node.js support
  * Async support
  * Growl (unobtrustive notifications) support
  * Fixture support
  * Ruby JavaScript testing server
  * Nested describes
  * Does not pollute core object prototypes
  * Cascading before/after/before_each/after_each hooks
  * Extremely simple and intuitive matcher declaration
  * Over 45 core matchers
  * Allows parens to be optional when using matchers to increase readability
  * Several helpful reporters (DOM, Terminal, ...)
  * Assertion graphs displaying how many, and which assertions pass or failed
  * Default / customizable evaluation contexts
  * DOM sandbox support
  * Great looking default DOM theme
  * `jspec` command-line utility for auto-running specs, and initializing project templates
  * Proxy or 'Spy' assertions 
  * Method Stubbing
  * Shared behaviors
  * Extend the jspec executable with project / user specific sub-commands.
  * Profiling
  * Interactive Shell
  * Ruby on Rails Integration
  * Install support projects with a single command (jQuery, Rhino, Prototype, Dojo, etc)
  * Tiny (2000-ish LOC)
  
## Companies Using JSpec

To add or request removal from this list please email tj@vision-media.ca

  * [Apple](http://apple.com)
  * [Google - YouTube](http://youtube.com)
  * [Palm](http://palm.com)
  * [Carfax](http://carfax.com)
  * [Apache CouchDB](http://couchdb.apache.org)
  * [Vision Media](http://vision-media.ca)

## Installation

Simply download JSpec and include _JSpec.css_ and _JSpec.js_ in your markup.
Head over to the downloads section on Github, clone this public repo, or 
add JSpec as a git submodule with in your project. Alternatively JSpec is
also available as a Ruby Gem (though this is not required), which also 
provides the `jspec` executable. First install [Gemcutter](http://gemcutter.org/) then execute:
    $ sudo gem install jspec

At which point you may:

    $ jspec init myproject

By default, the command above will use absolute path for all JSpec library files.
This behavior can be a problem when you're working across different computers or
operating systems. You can freeze the library or symlink it.

    $ jspec init myproject --freeze
    $ jspec init myproject --symlink

JSpec scripts should NOT be referenced via the `<script>` tag, they should be
loaded using the exec method (**unless you are using the grammar-less alternative**).
Below is an example:

    ...
    <script>
      function runSuites() {
        JSpec
        .exec('spec.core.js')
        .exec('spec.jquery.js')
        .run({ failuresOnly : true })
        .report()
      }
    </script>
    <body onLoad="runSuites()">
    ...

You may optionally want to use sources in the _/pkg_ directory
for your project, since it includes compressed alternatives generated
each release.

## Example

    describe 'ShoppingCart'
      before_each
        cart = new ShoppingCart
      end
      
      describe 'addProducts'
        it 'should add several products'
          cart.addProduct('cookie')
          cart.addProduct('icecream')
          cart.should.have 2, 'products'
        end
      end
    
      describe 'checkout'
        it 'should throw an error when checking out with no products'
          -{ cart.clear().checkout() }.should.throw_error EmptyCart
        end
      end
    end

## Grammar-less Example

JSpec's grammar is optional, you may also use the equivalent grammar-less
alternative below using pure JavaScript (when using the JSpec grammar you
may also use grammar-less assertions):

    JSpec.describe('ShoppingCart', function(){
      before_each(function{
        cart = new ShoppingCart
      })
   
      describe('addProducts', function(){
        it ('should add several products', function(){
          cart.addProducts('cookie')
          cart.addProducts('icecream')
          expect(cart).to(have, 2, 'products')
        })
      })
   
      describe('checkout', function(){
        it ('should throw an error when checking out with no products', function(){
          expect(function(){ cart.clear().checkout() }).to(throw_error, EmptyCart)
        })
      })
    }) 

## Options

The following options may be passed to _JSpec.run()_.

- fixturePath
  - {string} path to fixture directory (DOM, Terminal, Server)
- failuresOnly 
  - {bool} displays only failing specs, making them quick to discover and fix (DOM, Terminal, Server)
- reportToId   
  - {string} an element id to report to when using the DOM reporter (DOM)
- verbose
  - {bool} verbose server output, defaults to false (Server)
  
## Matchers

### Core

  - equal, be          
    - ===
  - be_a, be_an
    - have constructor of x
  - be_an_instance_of
    - instanceof x
  - be_at_least
    - &gt;=
  - be_at_most
    - &lt;=
  - be_null
    - == null
  - be_empty
    - length &lt; 0 or {}
  - be_true
    - == true
  - be_false
    - == false
  - be_type
    - be type of x
  - be_greater_than
    - &gt;
  - be_less_than
    - &lt;
  - be_undefined
    - check if variable passed is undefined
  - throw_error
    - should throw an error, optionally supply the error string or regexp for message comparison
  - have
    - object should have n of property (person.should.have(2, 'pets'))
  - have_at_least
    - object should have at least n of property
  - have_at_most
    - object should have a maximum n of property
  - have_within
    - object should have within n..n of property (person.should.have_within(1..3, 'pets')
  - have_length
    - length of n
  - have_prop
    - object should have property x, optionally supplying an expected value
  - have_property
    - strict version of have_prop
  - be_within
    - checks if n is within the range passed
  - include
    - include substring, array element, or hash key
  - match
    - string should match regexp x
  - respond_to
    - property x should be a function
  - eql                
    - matches simple literals (strings, numbers) with == 
        However composites like arrays or 'hashes' are recursively matched,
        meaning that [1, 2, [3]].should_eql([1, 2, [3]]) will be true.
  
### jQuery
  
 - have_tag, have_one
   - have exactly one tag   
 - have_tags, have_many
   - have more than one tag
 - have_child
   - have exactly one child
 - have_children
   - have more than one child
 - have_text
   - have plain text
 - have_attr
   - have an attribute, with optional value
 - have_type
 - have_id
 - have_title
 - have_alt
 - have_href
 - have_rel
 - have_rev
 - have_name
 - have_target
 - have_value     
 - have_class
 - have_classes
 - have_event_handlers
 - be_visible
 - be_hidden
 - be_enabled
 - be_disabled
 - be_selected
 - be_checked
 - be_animated
 
## Growl Support

JSpec uses the [JavaScript Growl](http://github.com/visionmedia/js-growl) library to provide
growl support when using the **Rhino JavaScript engine**. To enable simply `load()` _jspec.growl.js_
within _spec/rhino.js_
  
## Async Support With Mock Timers

The javascript mock timers library is available at [http://github.com/visionmedia/js-mock-timers](http://github.com/visionmedia/js-mock-timers)
although it is already bundled with JSpec at _lib/jspec.timers.js_

Timers return ids and may be passed to `clearInterval()`, however
they do not execute in threads, they must be manually scheduled and
controlled via the `tick()` function.

    setTimeout(function(){
      alert('Wahoo!')
    }, 400)
    
    tick(200) // Nothing happens
    tick(400) // Wahoo!
    
`setInterval()` works as expected, although it persists, where as `setTimeout()`
is destroyed after a single call. As conveyed by the last `tick()` call below,
a large increment in milliseconds may cause the callbacks to be called several times
to 'catch up'.

    progress = ''
    var id = setInterval(function(){
      progress += '.'
    }, 100)
    
    tick(50),  print(progress) // ''
    tick(50),  print(progress) // '.'
    tick(100), print(progress) // '..'
    tick(100), print(progress) // '...'
    tick(300), print(progress) // '......'
    
    clearInterval(id)
    
    tick(800) // Nothing happens
  
You may also reset at any time using resetTimers()

## Proxy Assertions

Proxy or 'Spy' assertions allow you to assert that a method is called n number
of times, with x arguments, returning x value. For example:

    person = { getPets : function(species){ return ['izzy'] }}
    person.should.receive('getPets', 'twice').with_args(an_instance_of(String))and_return(['izzy'])
    person.getPets('dog') // This will pass
    person.getPets()      // This will fail because we asked an instance of String

This is a useful mechanism for testing the behavior of your object, as well as
how other methods may interact with it. Below is another example:

    array = ['foo', 'bar']
    array.should.receive('toString').and_return('foo,bar')
    'array: ' + array // This line causes the spec to pass due to calling toString()

For more examples view _spec/spec.matchers.js_

## Method Stubbing

JSpec currently provides very simple stubbing support shown below:

    person = { toString : function(){ return '<Person>' } }
    stub(person, 'toString').and_return('Ive been stubbed!')
  
After each spec all stubs are restored to their original methods so
there is no reason to explicitly call `destub()`. To persist stubs, 
use a before_each hook:

    before_each
      stub(someObject, 'method').and_return({ some : thing })
    end

To destub a method simply call `destub()` at any time:

    destub(person, 'toString')
  
If you would like to wipe an object clear of stubs simply pass it
to `destub()` without an additional method argument:

    destub(person)
  
Alternatively both these utility functions may be called as methods
on any object when using the JSpec grammar:

    someObject.stub('method').and_return('whatever')
    // Converted to stub(someObject, 'method').and_return('whatever')

## Helpers

  * core

    - an_instance_of
      - used in conjunction with the 'receive' matcher
      
  * jspec.xhr.js
    - mockRequest, mock_request
      - mock a request
    - unmockRequest, unmock_request
      - unmock requests 
    - lastRequest, last_request
      - access previous request data 
                
  * jspec.jquery.js      
                
    - sandbox
      - used to generate new DOM sandbox, using jQuery object
    - element
      - same as invoking jQuery, just reads better and no need to worry about $ collisions
    - elements
      - alias of element

## Shared Behaviors

JSpec's support for shared behaviors allows multiple suites or describe blocks to share
common functionality, including specs and hooks. Shared functionality is run in the order in
which it is included in the hosting suite. For example a canine would inherit all 
behavior of an animal, and particular breeds of dog would inherit all behavior from the canine.
Note that as in the poodle example, shared behaviors can be nested inside suites or describe
blocks and will be visible only to other describe blocks _at or below_ the same nesting level.

	shared_behaviors_for 'animal'	
		before
			animal = { eats: function(){return true }}
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

NOTE: When the should_behave_like() call is searching for behaviors to include, it works inside out.
      Therefore any nested shared behaviors by the same name as a shared behavior at a higher
      nesting level will override the one at the higher level.
 

## Mock Ajax Requests

JSpec supports generic Ajax mocking which is usable with any JavaScript framework via _jspec.xhr.js_. The
API is comprised of two functions, `mock_request()` and `unmock_request()`. `unmock_request()` is
automatically called after each specification to restore the default functionality of XMLHttpRequest,
so it is uncommon to call `unmock_request()` directly. Below is a jQuery example:

    it 'should mock requests'
      mock_request().and_return('{ foo : "bar" }', 'application/json')
      $.getJSON('foo', function(response, statusText){
        response.foo.should.eql 'bar'
      })
    end

The mock_request().and_return signature is as follows:

    mock_request().and_return(<data>, [content-type], [response-status-code], [headers-hash])
  
At the moment `mock_request()` itself does not accept any arguments, however in the future
this will be used to target specific URIs for mocking.

Also, if the content-type of response is specified as XML, as specified in the XMLHttpRequest 
draft specification at : http://www.w3.org/TR/XMLHttpRequest/, the responseXML attribute of the response
will be an XML document generated by parsing the response body.

**NOTE**: works with Rhino as well

## Hooks

Currently the following hooks are supported, and may be utilized any number of times as they
are simply pushed to a stack. So for instance you may have two before_each blocks within the same
scope, they will both run, but this can help keep your specs readable.

- before       
  - run once before the suite is executed
- after
  - run once after the suite is executed
- before_each
  - run before each specification
- after_each
  - run after each specification
- before_nested
  - run once before the suite and once before any nested suites
- after_nested
  - run once after the suite and once after any nested suites

## Custom Contexts

Custom contexts can be applied to supply helper
methods or properties to all subsequent bodies (other hooks, or specs).

Keep in mind that when replacing the default context you will loose 
functionality provided by it, unless you manually merge it with your 
custom context.

To reset the context simply assign null to obtain the original context.

    ...
    before
      JSpec.context = { foo : 'bar' }
    end
    
    after
      JSpec.context = null
    end
    
    it 'will work ;)'
      foo.should_equal 'bar'
    end
    ...

## Async Support

Currently only _jspec.jquery.js_ supports async requests. JSpec uses `jQuery.ajaxSetup` and sets all
requests to sync, which preserves execution order, and reports correctly.

    it 'should load mah cookies (textfile)'
      $.post('async', function(text){
        text.should_eql 'cookies!'
      })
    end

## Grammar Pre-processor

The pre-processing capability of JSpec is extremely powerful. Your JavaScript
code is not necessarily what it seems. For example when you seemingly invoke a
object's prototype like below:

    'foobar'.should.include 'bar'

First parens are added:

    'foobar'.should.include('bar')

Secondly the matcher invocation is converted to a non-polluting match() call:

    expect('foobar').to(include, 'bar')

This also means instead of:

    var object = { foo : 'bar' }
    object.should.include 'foo'

We can do:
 
    { foo : 'bar' }.should.include 'foo'

### Closure Literal

These are equivalent:

    -{ throw 'test' }.should.throw_error
    function() { throw 'test' }.should.throw_error

### Inclusive Range Literal

The following expands to the array of [1,2,3,4,5]

    n.should.be_within 1..5
    
### __END__

Any text placed after **__END__** is considered irrelevant and
is striped out before evaluation. This is sometimes useful for
document or code reference while writing specs. 

For example when writing regression specs it is sometimes useful
to paste the issue ticket's comment(s) below this area for reference. 

## Formatters

To change a reporter simply alter the options hash like below, assigning
a new constructor, or pass it within the hash to `run()`:

    JSpec.options.reporter = JSpec.reporters.Terminal

OR

    JSpec
    .exec('...')
    .run({ reporter: JSpec.reporters.Terminal })
    .report()
	
## Fixtures

The `fixture()` utility function may be used in order to load arbitrary file contents
for use with your specifications. JSpec will resolve `fixture('data')` in the following
manor:
  
  - <fixturePath>/data
  - <fixturePath>/data.html

In order for the `fixture()` utility to function you must pass the **fixturePath** option
to _JSpec.run()_ which provides JSpec with the fixture directory.

The `json_fixture()` utility works much the same as `fixture()` however `fixture('data')` 
will be parsed as JSON, and resolved as shown below:

  - <fixturePath>/data
  - <fixturePath>/data.json

## Testing DOM Elements

When using jQuery testing DOM elements is very easy. Many may think they require specific
sandbox divs in their html, however you do not. Using the fixture support mentioned above
you may simply load some HTML, and use the `elements()` utility which is an alias of jQuery:

    describe 'JSpec DOM testing'
      describe 'is so easy'
        before_each
          list = elements(fixture('users-list'))
          // or list = jQuery(fixture('users-list'))
          // or list = $(fixture('users-list'))
        end
        
        it 'should have users'
          list.should.have_tag 'ul'
        end
      end
    end
  
You may also use simple strings, since jQuery's constructor will convert them to DOM elements:

    describe 'Something'
      before_each
        html = elements('<p>Foo</p>')
        // or html = $('<p>Foo</p>') ...
      end
      
      it 'should do something'
        html.should.have_text 'Foo'
      end
    end

## Custom Matchers

First lets create a simple equality matcher. In the case below JSpec is smart enough to realize
this is simply a binary operator, and simply transforms this into `actual === expected`

    JSpec.addMatchers({
      equal : '==='
    })

To alias a method to keep your specs readable you may alias them like below:

    JSpec.addMatchers({
      be : 'alias equal'
    })
    
    'foo'.should.equal 'foo'
    true.should.be true

Matchers with string bodies implicitly return the expression value.
The expanded version of the equal matcher would then be:

    JSpec.addMatchers({
      equal : 'actual === expected'
    })

Large matchers or those which require several parameters may wish
to utilize the hash method:

    JSpec.addMatchers({
      equal : { match : function(actual, expected){
        return actual === expected
      }}  
    })

To keep JSpec tiny, JSpec will default to generating failure messages
for you, how ever this can be explicitly defined:

    JSpec.addMatchers({
      equal : { 
        match : function(actual, expected){
          return actual === expected
        },
        message : function(actual, expected, negate) {
          return 'a message here'
        }
      }
    })
  
When defining matchers that are extremely similar in functionality, however
require different names, you may use a prefixed list of words like below which
defines be_disabled, be_selected, be_checked, and have_type, have_id, etc. Each
function must return the matcher body which will be used.

    JSpec.addMatchers({
      'be disabled selected checked' : function(attr) {
        return 'jQuery(actual).attr("' + attr + '")'
      },
    
      'have type id title alt href src sel rev name target' : function(attr) {
        return function(actual, value) {
          return value ? jQuery(actual).attr(attr) ## value:
                         jQuery(actual).attr(attr)
        }
      }
    })

## Extending Or Hooking Into JSpec

JSpec provides a hook architecture for extending or analyzing various
points in its execution, through the use of modules. For a module
example view _lib/jspec.jquery.js_. 

The following methods or properties are utilized by JSpec:

  - name       : module name string
  - init       : called to initialize a module
  - reporters  : hash of reporters merged with JSpec.reporters
  - utilities  : hash of utility functions merged with JSpec.defaultContext
  - matchers   : hash of matchers merged with JSpec's core matchers via JSpec.addMatchers()
  - DSLs       : hash of DSL methods; for example DSLs.snake contains before_each, after_each, etc.
    Where as DSLs.camel may contain beforeEach, afterEach, etc.

Below is a list of hooks, descriptions, and valid return values which
may simply be implemented as module methods. beforeSuite, afterSuite, beforeSpec, and afterSpec have lower
precedence than before_each, after_each etc within the specs themselves, allowing them to override or undo
anything that has been done by a Module.

  - running(options)                 : started running JSpec with the options passed    : returning 'stop' will halt running
  - loading(file)                    : loading a file                                   : returning 'stop' will prevent loading
  - executing(file)                  : executing a file                                 : returning 'stop' will prevent execution 
  - posting(data, url)               : posting data to a url                            : returning 'stop' will prevent request
  - preprocessing(input)             : before input string is preprocessed              : return input string for next hook to preprocess
  - stubbing(object, method, result) : called when stubbing an object's method, and return value (result). : (no return value)
  - requiring(dependency, message)   : requiring a dependency                           : (no return value) 
  - beforeAssertion(assertion)       : before an assertion has been made                : (no return value)
  - afterAssertion(assertion)        : after an assertion has been made                 : (no return value)
  - addingMatcher(name, body)        : unprocessed matcher name and body                : (no return value)
  - addingSuite(suite)               : adding Suite instance to JSpec                   : (no return value)
  - beforeSuite(suite)               : before running of suite (describe block)         : (no return value)
  - afterSuite(suite)                : after running of suite  (describe block)         : (no return value)
  - beforeSpec(spec)                 : before running of spec  (it block)               : (no return value)
  - afterSpec(spec)                  : after running of spec   (it block)               : (no return value)
  - reporting(options)               : called before reporting                          : (no return value)
  - evaluatingBody(dsl, matchers, context, contents) : evaluating body contents, with the given context, matchers and dsl. : (no return value)
  
For example you may wish to proxy files which are being executed, simply implement the 
executing method like below. This example will stop execution of any file matching /matchers/.

    MyModule = {
      executing : function(file) {
        if (file.match(/matchers/))
          return 'stop'
      }
    }
    JSpec.include(MyModule)
  
Immutable values may also be passed to hooks using hookImmutable() internally. This allows
for simple numbers, strings, etc to be utilized or altered within a hook implementation. Below
is an example module which adds functionality to the JSpec grammar by converting `SomeObject.stub('method')`
to `stub(SomeObject, 'method')`:

    JSpec.include({
      preprocessing : function(input) {
        return input.replace(/(\w+)\.(stub|destub)\((.*?)\)$/gm, '$2($1, $3)')
      }
    })
  
## JSpec Command-line Utility

When installed as a Ruby Gem, the `jspec` executable will become available,
allowing you to initialize project templates quickly, as well as auto-testing
specifications when a file is altered.

Initialize JSpec-driven project template in directory _myproject_:
    $ jspec init myproject

Once within 'myproject' start testing by executing:
    $ jspec

For additional usage execute:
    $ jspec help

Or for specific usage:
    $ jspec help run
    
## Extending JSpec's Executable

Both project specific, and user specific sub-commands may be used to 
extend those already provided by `jspec`. For example create the following
in spec/commands/example_command.rb which are loaded when `jspec` is executed.

    command :example do |c|
      c.syntax = 'jspec example [options]'
      c.description = 'Just an example command'
      c.option '-f', '--foo string', 'Does some foo with <string>'
      c.option '-b', '--bar [string]', 'Does some bar with [string]'
      c.example 'Do some foo', 'jspec example --foo bar'
      c.example 'Do some bar', 'jspec example --bar'
      c.when_called do |args, options|
        p args
        p options.__hash__
        # options.foo
        # options.bar
        # options.__hash__[:foo]
        # options.__hash__[:bar]
      end 
    end 
  
And execute with:

  `$ jspec example`  
  
They may also be placed at ~/jspec/commands for global usage.

For more information on the command creation visit http://visionmedia.github.com/commander
    
## Installing Support Projects

Lets say you need jQuery for your project, and wish to test against it. You could download
jQuery manually, use an absolute uri to Google's CDN, or use the following command, which will
install jQuery to _spec/support/jquery.js_.
    $ jspec install jquery
  
Alternatively we may specify the destination path:
    $ jspec install jquery spec/jquery.js
  
Or provide a specific version string:
    $ jspec install jquery --release 1.3.1
  
The install command will also install Rhino for you (**MacOS only**) so you
can run specs, and js via the command-line.
    $ jspec install rhino

To view the current projects supported view:
    $ jspec help install
  
## Rhino

JSpec provides transparent support for Rhino, while using the Terminal reporter.
Simply create a JavaScript file with contents similar to below, and then execute
the command following it:

    load('lib/jspec.js')
    
    JSpec
    .exec('spec/spec.grammar.js')
    .exec('spec/spec.core.js')
    .run({ reporter: JSpec.reporters.Terminal, failuresOnly: true })
    .report()

Initialize project with:
    $ jspec init myproject 

Run with:
    $ jspec run --rhino

Or bind (automated testing):
    $ jspec --rhino 

## Server

The Ruby JavaScript testing server included with JSpec simply runs
the spec suites within each browser you specify, while reporting result
back to the terminal. It is essentially the same as using the DOM reporter
and auto-testing each browser, however results are centralized to the terminal,
removing the need to manually view each browser's output.

When utilizing the server if a file named _spec/jspec.rb_ (or _jspec/jspec.rb_ for rails)
is present, then it will be loaded before the server is started. This allows you to
add Sinatra routes, support additional Browsers, etc.

Run with all supported browsers:
    $ jspec run --server
  
Run with specific browsers:
    $ jspec run --browsers Safari,Firefox,Chrome,Explorer
  
Run with alternative browser names:
    $ jspec run --browsers safari,ff,chrome,ie
  
Browsers supported in core:

- Browser::Default (system default)
- Browser::Safari
- Browser::WebKit
- Browser::Chrome
- Browser::Firefox
- Browser::Opera
- Browser::IE
  
Supplied routes:

- /slow/NUMBER
- /status/NUMBER
  
For example `$.get('/slow/4', function(){})` will take 4 seconds
to reply, where as `$.get('/status/404', function(){})` will respond
with an 404 status code. Add additional Sinatra routes to the jspec.rb
file to add your own functionality.

## Interactive Shell

JSpec provides an interactive shell through Rhino, utilize with:

    $ jspec shell

Or to specify additional files to load:

    $ jspec shell lib/*.js

Or view additional shell help

    $ jspec help shell
    
When running the shell JSpec provides several commands:

  - quit, exit
    - Terminate the shell session 
  - p()
    - Inspect the object passed
    
Or add your own. In the examples below, `foo` will become a getter, so it can
be invoked simply as `$ foo ` where as `bar` is a regular function which must be called
as `$ bar("something") `.
  
  Shell.commands.foo = ['Does some foo', function(){ return 'something' }] 
  Shell.commands.bar = ['Does some bar', function(o){ return 'something' }]
      
## Ruby on Rails

No additional gems are required for JSpec to work with rails, although 
[jspec-rails](http://github.com/bhauman/jspec-rails) has been created by 'bhauman'. JSpec
supports Rails out of the box, simply execute:

    $ jspec init --rails
  
Then while still in the root directory of your Rails project, run the following
command which will bind to, and refresh your browsers automatically when any changes 
are made to _./public/javascripts/*.js_ or _./jspec/*.js_

    $ jspec
  
Or just like regular JSpec applications, run once:

    $ jspec run
  
Or run via the terminal using Rhino:

    $ jspec run --rhino
  
## Supported Browsers

Browsers below are supported and can be found in _server/browsers.rb_, however
your _spec/server.rb_ file may support additional browsers.

- Safari
- WebKit
- Chrome
- Firefox
- Opera
- Internet Explorer
  
## Known Issues

- The preprocessor is not (yet) capable of multiline conversions. For example the following is invalid
  
    object.stub('getContentsOfURL').and_return(function(url){
      return 'html'
    })
  
  In cases such as this, you may always revert to utilizing JSpec in a grammar-less form as follows:
  
    stub(object, 'getContentsOfURL').and_return(function(url){
      return 'html'
    })
  
## Additional JSpec Modules

- JSocka stubbing http://github.com/gisikw/jsocka/tree/master
  
## More Information

- [Google Group](http://groups.google.com/group/jspec)
- IRC Channel [irc://irc.freenode.net#jspec](irc://irc.freenode.net#jspec)
- Featured in Devmag ["Advanced JavaScript"](http://www.dev-mag.com/2010/02/18/advanced-javascript/) ebook for 4$
- Featured article in JSMag [http://www.jsmag.com/main.issues.description/id=21/](http://www.jsmag.com/main.issues.description/id=21/)
- Syntax comparison with other frameworks [http://gist.github.com/92283](http://gist.github.com/92283)
- Get the TextMate bundle at [https://github.com/visionmedia/jspec.tmbundle/tree](https://github.com/visionmedia/jspec.tmbundle/tree)
- For more information consult the JSpec source code documentation or visit [http://visionmedia.github.com/jspec](http://visionmedia.github.com/jspec)
- jQuery + HTML fixture example [http://gist.github.com/147831](http://gist.github.com/147831)
- [http://twitter.com/tjholowaychuk](Twitter)
- [JSpec Vim Snippits](http://github.com/tobiassvn/snipmate-jspec/)

## Contributors

Many ideas and bug reports were contributed by
the following developers, thank you for making
JSpec more enjoyable, and bug free. If I have 
missed you on this list please let me know 
(aka the fellow who donated [jspec.info](http://jspec.info))

- Lawrence Pit
- [mpd@jesters-court.ne](mpd@jesters-court.ne)
- [Sarah Brown](brown.sarah.v@gmail.com)
- [kevin.gisi@gmail.com](kevin.gisi@gmail.com)
- [tony_t_tubbs@yahoo.com](tony_t_tubbs@yahoo.com)
- [enno84@gmx.net](enno84@gmx.net)
- swalke16
- fnando
- Tobias Svensson

## License 

(The MIT License)

Copyright (c) 2008 - 2010 TJ Holowaychuk <tj@vision-media.ca>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


