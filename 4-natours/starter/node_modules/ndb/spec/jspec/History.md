
4.3.2 / 2010-05-30
==================

  * Fixed nodejs support due to recent Buffer changes

4.3.1 / 2010-05-04
==================

  * Fixed; proper handling of undefind values for have_prop[erty]

4.3.0 / 2010-05-04
==================

  * Added chromium to supported browsers
  * Fixed rhino support by using java command
  * Fixed MockXMLHttpRequest#getAllResponseHeaders() matches spec returning a string

4.2.1 / 2010-04-15
==================

  * Fixed; strict type checks for have_prop[erty]
  * Removed some globals

4.2.0 / 2010-04-07
==================

  * Merge branch 'master' of git://github.com/vipulb/jspec into xml
  * Added support for mock requests to parse xml
  * Added have_event_handlers matcher
  * Adding be_animated matcher
  * Add option "disableColors" to disable coloring in terminal reporter

4.1.0 / 2010-03-25
==================

  * Added jspec.nodejs.js - have_prototype matcher
  * Added jspec.nodejs.js - have_keys matcher
  * Added jspec.nodejs.js - have_configurable_property matcher
  * Added jspec.nodejs.js - have_writable_property matcher
  * Added jspec.nodejs.js
  * Remove unused error() method

4.0.0 / 2010-03-22
==================

  * Added json_fixture(). Closes #157
  
  * Added swalke16 to contrib list (shared behavior fixes)
  
  * Added shared_behaviors_for() for shared behavior support.
    This is essentially a Suite instance, however the shared
    behavior itself is no longer executed, only suites which use
    should_behave_like().
    
  * Added before_nested / after_nested for legacy support.
    These hooks function just as before / after did < 4.0.0,
    where they will execute once per nested suite as well.
    
  * Changed; before / after are now executed ONLY once, not
    when a nested suite is running. Use before_nested / after_nested 
    if you wish to re-gain this functionality.
    
  * Removed JSpec.error()

3.3.3 / 2010-03-15
==================

  * Added nodejs template. use --node

3.3.2 / 2010-02-25
==================

  * Fixed; output bug with shared behaviors

3.3.1 / 2010-02-22
==================

  * Added have_any matcher
  * Fixed; using readFileSync for node.js support

3.3.0 / 2010-02-16
==================

  * Added support for Chrome on Linux [alex-bepple]
  * Added node.js support in core, no longer has node-specific code in template
  * Fixed linux Default browser support, use 'xdg-open' [alex-bepple]
  * Fixed lastRequest global
  * Removed Console reporter. Closes #142

3.2.1 / 2010-02-02
==================

  * Fixed JRuby compatibility; Look up host in a JRuby-compatible way.

3.2.0 / 2010-01-27
==================

  * Added support for running specs in WebKit nightlies.
  * Fixed bug in dom.html templates that was incorrectly passing options to report() rather than run().

3.1.3 / 2010-01-14
==================

  * Fixed node.js template which was missing fixturePath option. Closes #131
  * Fixed some stray globals

3.1.2 / 2010-01-14
==================

  * Changed dependency; commander 4.0.1 for JRuby support
  * Fixed rails init issue with node.js. Closes #135
  * Fixed bin specs

3.1.1 / 2010-01-14
==================

  * Fixed include matcher substring matching regexp issue. Closes #132

3.1.0 / 2010-01-05
==================

  * Added --node (works just like --rhino)
  * Added Node.js support [#114]
  * Fixed markdown < > chars in Readme.md

3.0.0 / 2010-01-04
==================

  * Added JSpec.equal() replacing hash()
  * Added Rhino's .jar to JSpec so that users do not need to install it
  * Added specs for receive matcher negation with times [#150]
  * Added fixturePath option to let JSpec know where your fixtures live
  * Added `jspec stats`
  * Added lastRequest() / last_request() helper [#58]
  * Added jspec.xhr.js in templates by default [#44]
  * Added jspec subcommand hooks; checks for spec/commands/*_command.rb [#38]
  * Added circular reference printing support now shown as { foo: "bar", self: &lt;circular reference&gt; }
  * Added install sub-command with support for jquery, jqueryui, prototype, mootools, dojo, envjs, and rhino
  * Added update support for --freeze / --symlink [#34]
  * Changed; defaulting browsers using system calls [#104]
  * Changed; using json_pure gem instead of json to prevent c extension requirements 
  * Changed argumentsToArray() -> toArray() [#62]
  * Changed formatter to reporter [#6]
  * Changed project templates to a newer cleaner format with markdown files, and better structure
  * Changed; Rails is now detected when using `jspec init` --rails is no longer required
  * Changed; Major refactor of the `jspec` executable and all Ruby
  * Changed; Ruby server re-written using Sinatra
  * Removed JSpec.hash()
  * Removed JSpec.paramsFor()
  * Removed profiling [#85]
  * Removed module contexts [#72]
  * Fixed --rhino from exiting using --bind [#111]
  * Fixed sprite spacing when several failure messages are shown [#90]
  * Fixed receive matcher negation issue with the number of times called [#150]
  * Fixed #send_file override; no-cache [#93]
  * Fixed most css issues in IE8 [#71]
  * Fixed "Access is denied" error in IE
  * Fixed __END__
  * Fixed; inverted core specifications (mock_it()) for easier contribution
  
2.11.13 / 2009-11-22
--------------------

  * Fixed dom template root replacement
  * Added Tobias Svensson to contributor list

2.11.12 / 2009-11-12
--------------------

  * Changed; DOM formatter displaying several failure messages when present [#89]
  * Changed; displaying multiple error messages for Terminal formatter
  * Updated mock timers to 1.0.2
  * Fixed receive matcher negation issue with the number of times called [#150]

2.11.11 / 2009-10-23
--------------------

  * Added cheat sheet install docs
  * Added Google Group link
  * Added sarah to contrib list
  * Changed Terminal formatter's java.lang.System.exit() -> quit()
  * Removed unnecessary flags from several regexps
  * Fixed DOM paths when using --freeze [#88]
  * Fixed __END__

2.11.10 / 2009-10-19
--------------------

  * Fixed exit status with Terminal reporter [#77] [thanks darxriggs for reporting]
    This is now fixed when using `jspec run --rhino` as well as `java -jar js.jar spec/spec.rhino.js`.

2.11.9 / 2009-10-16
-------------------

  * Fixed puts() with jQuery instance without .selector should output outerHTML, not innerHTML
  * Fixed some specs breaking when using Env.js
  * Fixed Env.js support

2.11.8 / 2009-10-16
-------------------

  * Fixed newline support in grammar (supports \r\n, \n, \r)
  * Fixed tabs in grammar [#11]

2.11.7 / 2009-10-15
-------------------

  * Fixed minor grammar issues for windows users [thanks Tony]
  * Fixes installation issue when XCode is not present; changed dependency json -> json_pure [thanks esbie]
  * Fixed Chrome#visit; latest builds of Chrome for the mac are now "Google Chrome"

2.11.6 / 2009-10-12
-------------------

  * Added Tony to contributor list
  * Removed JSpec.paramsFor()
  * Removed module contexts [#72]
  * Fixed some css styling issues in IE8 [#71]
  * Fixed; DOM formatter supporting \r\n \r \n for EOL in the body source [Thanks Tony]
  * Fixed "Access is denied" error in IE
  * Fixed some css support for older browsers [Thanks Tony]

2.11.5 / 2009-10-10
-------------------

  * Fixed dependencies (created by github's gem builder removal)

2.11.4 / 2009-10-10
-------------------

  * Updated installation docs
  * Removed namespaced dependencies (thanks alot github...)

2.11.3 / 2009-09-30
-------------------

  * Updated to mock timers 1.0.1
    fixes an issue where setTimeout(function(){}, 0); tick(100) is never called

2.11.2 / 2009-09-21
-------------------

  * Fixed example path in rails template

2.11.1 / 2009-09-10
-------------------

  * Fixed JSpec root when using --symlink, --freeze [#36]
  * Added __END__ to the grammar (works like Ruby's __END__)

2.11.0 / 2009-09-04
-------------------

  * Added --symlink switch (links the current version of JSpec to ./spec/lib) [#4]
  * Added --freeze switch (copies the current version of JSpec to ./spec/lib) [#4]

2.10.1 / 2009-09-02
-------------------

  * Added `jspec shell` sub command (interactive Rhino shell through JSpec)
  * Added jspec.shell.js

2.10.0 / 2009-08-27
-------------------

  * Added Async support via mock timers (lib/jspec.timers.js) [#19]
  * IRC channel up and running! irc://irc.freenode.net#jspec

2.9.1 / 2009-08-21
------------------

  * Added module support for formatters

2.9.0 / 2009-08-21
------------------

  * Server output matching Rhino when using verbose or failuresOnly options
  * Added mock_request() and unmock_request() as aliases for mockRequest() and unmockRequest()
  * Added JSpec.JSON.encode()
  * Added default Sinatra routes /slow/NUMBER and /status/NUMBER for simulating
  slow reponses and HTTP status codes.
  * Added server support for loading spec/jspec.rb (or jspec/jspec.rb for rails)
  Allowing additional browser support to be plugged in, as well as Sinatra routes.
  * Added dependency for Sinatra (new server)
  * Added a new Ruby server
  * Added support for --bind and --server on various platforms
  * Added Google Chrome support
  * Added Internet Explorer support
  * Change; --server without --browsers defaults to all supported browsers
  * Removed JSpec.reportToServer()
  Now utilizes JSpec.formatters.Server to handle this 
  functionality.
  * Fixed Server output escaping (removed html escaping from puts()) [#13]
  * Fixed JSpec.load(); returns responseText when 2xx or 0 (for file://)

2.8.4 / 2009-08-02
------------------

  * Fixed error thrown when a module has no utilities

2.8.3 / 2009-07-30
------------------

  * Added JSpec.evalHook() 
  * Added JSpec.paramsFor()
  * Refactored jspec.xhr.js
  * Fixed mock xhr HEAD method
  * Fixed node.js print() newline issue
  * Fixed specs preventing spec/spec.node.js from running

2.8.2 / 2009-07-29
------------------

  * Added JSpec.tryLoading()
  * Added JSpec.request used to reference the original XMLHttpRequest; used to fix [#149]
  * Fixed Mock XHR issue messing up JSpec request related utilities such as fixture() [#149]

2.8.1 / 2009-07-27
------------------

  * Added Lawrence Pit as a contributor
  * Fixed object hash equality [#146]
  { a : '1', b : '2' } is now the same as:
  { b : '2', a : '1' }

2.8.0 / 2009-07-27
------------------

  * Give readFile precendence over xhr so that fixtures work with mockRequest when using Rhino
  * Give XMLHttpRequest precedence over microsoft crap
  * Added Mock Ajax Support
  * Added mockRequest(), unmockRequest() utilities
  * Added jspec.xhr.js
  * Fixed be_visible, and be_hidden. Now implement the jQuery <= 1.3.1 method

2.7.2 / 2009-07-24
------------------

  * Fixed "end" in spec bodies when using the grammar
  * Fixed "it" in spec bodies when using the grammar [#142]
  * Changed; HTML entities in descriptions are now escaped for DOM formatter [#141]
  * Added enno84@gmx.net as a contributor (thanks for the bug reports)

2.7.1 / 2009-07-17
------------------

  * Changed; hash() now accepts null
  * Fixed should_receive issue with validating boolean args or return values
  * Fixed --server-only switch
  * Fixed jQuery dependency error message when jQuery is not available
  when using jspec.jquery.js

2.7.0 / 2009-07-14
------------------

  * Added fixture() utility function
  * Templates initialize with example paths to lib

2.6.0 / 2009-07-09
------------------

  * Added Ruby on Rails support
  * Added exporting of JSpec (node.js etc)
  * Added be_undefined matcher [#134]

2.5.1 / 2009-07-07
------------------

  * Added intermediate node.js support
  * Fixed; grammar now allows foo.bar.baz.stub() etc to convert to stub(foo.bar.baz)

2.5.0 / 2009-07-03
------------------

  * Added contrib in README (thanks to anyone who has helped)
  * Added more shared behavior specs
  * Added Module.DSLs support for extending / adding new DSLs (DSL exchange not yet fully implemented)
  * Added spec to make sure methods like end() will not fail due to the grammar
  * Changed; giving hook precedence to suite hooks (before_each, etc) over module hooks (beforeSuite, etc) ; (thanks mpd)
  * Changed; calls to stub() without and_return() now simply stub an arbitrary method with no return value
  * Changed JSpec.include(); now returns JSpec allowing chaining
  * Fixed having "end" in descriptions which would be replaced with '});'
  * Fixed negation of should.receive('foo') matcher
  * Fixed shared behavior assertion count issue

2.4.3 / 2009-07-02
------------------

  * Fixed matcher semicolon matcher issue when using the JSpec grammar
  * Added pass() util; Spec#pass() and Spec#fail() (thanks gisikw)
  * Removing Object.prototype.stubby() after specs are finished to prevent pollution

2.4.2 / 2009-06-30
------------------

  * Fixed trailing comma (thanks Kevin)

2.4.1 / 2009-06-30
------------------

  * Moved beforeSpec and afterSpec hook into proper positions
  allowing for additional assertions within afterSpec.

2.4.0 / 2009-06-30
------------------

  * Added hook() and hookImmutable()
  * Added support for matcher lists ('be enabled disabled selected') == be_enabled, be_disabled etc
  * Added JSpec.include()
  * Added several hooks
  * Added Module support
  * Added grammar conversion of Foo.stub('method') to stub(Foo, 'method') 
  * Added grammar conversion of Foo.destub() to destub(Foo) 
  * Require bind gem
  * Fixed `jspec` bin docs

2.3.1 / 2009-06-25
------------------

  * Fixed; all stubs generated with stub() are restored
  to their original methods after each 'it' block. See
  README for details.

2.3.0 / 2009-06-25
------------------

  * Added stub()
  * Added destub()
  * Changed; Server responses utilize Rack::Mime now for arbitrary requests

2.2.1 / 2009-06-22
------------------

  * Changed; reportToServer() now accepts url arg

  * Fixed be_empty matcher; now considers {} empty, however { foo : bar } is not
  * Fixed throw_error error messages for Opera
  * Fixed throw_error in Rhino (Opera is broken now)
  * Fixed stray console.log() call

  * Fixed some tab issues.
  When using the JSpec grammar option you should
  use the 'soft tabs' feature of your IDE or text editor.
  A patch for tabs is pending and should be available soon,
  however be aware that a 'parse error' may occur otherwise.

2.2.0 / 2009-06-18
------------------

  * Added link to JSpec in JSMag June 2009
  * Added Github gem source location to docs
  * Changed throw_error matcher; now accepts two arguments
  * Changed --server; serves from current working directory. 
  This allows files in ../lib/  * to be served rather than ./spec/  * only.
  * Refactored argumentsToArray()

2.1.0 / 2009-06-12
------------------

  * Changed `jspec init` to utilize a single template
  which allows for all three suite running capabilities
  within a single template. Now after initializing a 
  project you may `jspec run --server`, `jspec run --rhino`
  etc at any time without modifications.

2.0.3 / 2009-05-15
------------------

  * Table should span full width
  (Very week release I know, but improperly styled things bug me :) )

2.0.2 / 2009-05-11
------------------

  * Added rails integration link http://github.com/bhauman/jspec-rails
  * Changed; puts() now displays constructor name when available
  * Fixed Terminal output which was not displaying due to a recent commit
  * fixed IE bug : DOM elements don't have valueOf() method

2.0.1 / 2009-05-01
------------------

  * Added better failure messages for throw_error matcher
  * Renamed print() to puts() [#108]

2.0.0 / 2009-04-27
------------------

  * Added DOM loading indicator [#105]
  * Added wait() helper for additional async support
  * Added shared behavior support using should_behave_like('Another Suite')
  * Added CSS body toggling [#1]
  * Added receive matcher for Proxy Assertins
  * Added grammar-less support
  * Added an_instance_of() helper
  * Removed .this literal
  * Removed deprecated be_a_TYPE_input matchers

  * Added ProxyAssertion 
  * Added select() util
  * Added does() util for report-less assertions
  * Added find() util 
  * Added JSpec.contentsOf()
  * Added matchers to body evaluation [#90]

1.1.7 / 2009-04-22
------------------

  * Removed trailing commas causing issues with IE (what a suprise ;) )

1.1.6 / 2009-04-22
------------------

  * Fixed typo in requires()
  * Added expect()

1.1.5 / 2009-04-17
------------------

  * Strengthened specs for cascading hooks
  * Fixed cascading hooks

1.1.4 / 2009-04-17
------------------

  * Added rhino and server template files
  * Added JSpec.hasXhr()
  * Added JSpec.xhr()
  * Added Ruby javascript testing server
  * Added support for options passed to run()
  * Added failuresOnly for Terminal formatter
  * Added terminal assertion graphs
  * Addec color() utility
  * Added main.puts() since we use print() as a utility
  * Added rhino support
  * Added fail() utility function
  * Added JSpec.Assertion
  * Added normalizeMatcherMessage()
  * Added normalizeMatcherBody()
  * Added have_classes [#19]
  * Added extend() utility
  * Added be_an_instance_of matcher
  * Added constructor checking support for throw_error matcher [#72]
  * Added file support for exception messages, making them much easier to debug
  * Added catching of exceptions throw within specs [#46]
  * Changed; executable aborts when template does not exist
  * Changed; matchers now normalized upon creation, accepts function, hash, or string.
  * Changed be() matcher to be strict [#57]
  * Changed error() to conditionally show line number when available
  * Renamed Jspec.addSuite to JSpec.describe and Suite#addSpec to Suite#it
  * Refactored be_a_TYPE_input matchers so that the deprication warning is logged only when calling the method
  * Fixed JSpec.requires() now works with latest version of JSpec.error()
  * Fixed error() now displays exceptions throw that do not respond to .message
  * Fixed commenting bug [#37]
  * Removed JSpec.main, now just using local main

1.1.3 / 2009-04-14
------------------

  * Removed /test used for the executable, causing gem to fail building

1.1.2 / 2009-04-14
------------------

  * Added `jspec update` sub-command [#63]

1.1.1 / 2009-04-12
------------------

  * Added gemspec

1.1.0 / 2009-04-12
------------------

  * jspec executable fully functional

1.0.4 / 2009-04-09
------------------

  * Added `jspec bind`
  * Added `jspec run`
  * Added `jspec init`
  * Added `jspec` executable
  * Added gemspec and manifest
  * Added command-line usage docs
  * Added custom matchers documentation
  * Removed double negation

1.0.3 / 2009-04-08
------------------

  * Added have_prop matcher, have_property is now strict [#56]

1.0.2 / 2009-04-08
------------------

  * Added be_selected, be_checked matchers
  * Added string support to each() each('some foo bar', ...)
  * Added have_ATTR matchers [#51]
  * Deprected be_a_TYPE_input matchers [#50]

1.0.1 / 2009-04-07
------------------

  * Added have_property matcher [#53]

1.0.0 / 2009-04-06
------------------

  * Added option() which gives the query string option precedence [#39]
  * Changed; Using JSpec.options.formatter not JSpec.formatter [#44]
  * Fixed Console formatter, now displays nested suites
  * Check out http://visionmedia.github.com/jspec for additional documentation!

0.9.6 / 2009-04-03
------------------

  * Added nesting support
  * Added printing of nested specs
  * Added assertion graphs to DOM formatter
  * Refactored preprocess()
  * Refactored most of the specs
  * Renamed preProcess() to preprocess()
  * Removed running of a single suite via ?suite= for now

0.9.5 / 2009-04-02
------------------

  * Added support for printing of function bodies and regexps [#27]
  * Added support for strings / regexp with should_throw_error [#26]
  * Added have_within matcher
  * Added have_at_most matcher
  * Added have_at_least matcher
  * Added have matcher [#24]

0.9.4 / 2009-04-02
------------------

  * Added be_a_TYPE_input matchers (be_a_checkbox_input, be_a_text_input, etc)
  * Added be_disabled matcher [#21]
  * Added be_enabled matcher [#20]
  * Refactored be_visible and be_hidden with $(elem).is()

0.9.2 / 2009-04-02
------------------

  * Added support for multi-arg failure messages [#2]
  * Better printing of jQuery objects [#15]

0.9.1 / 2009-04-02
------------------

  * Added support for dotted negation of assertions (foo.should.not.equal bar)
  * Added support for dot-style assertions [#17] (foo.should_not.equal bar)

0.9.0 / 2009-04-01
------------------

  * Added spec for strip()
  * Added strip()
  * Added any() util
  * Added new improved include matcher
  * Added have_many and have_one matchers
  * Added have_attr matcher [#14]
  * Added map() util
  * Added inject() util
  * Added escape() util
  * Added recursive array and object printing
  * Added DOM formatter option failuresOnly
  * Added support for running of a single squite via ?suite=...
  * Added query() util
  * Added last() util
  * Added be_within matcher, accepts a range literal
  * Added inclusive range literal n..n
  * Added row hover
  * Refactored range()
  * Refactored setMessage()
  * Refactored hash()
  * Changed; preprocessor passing array of args (multi-arg matcher support)
  * Changed jQuery to $ for internal usage

0.8.0 / 2009-02-27
------------------

  * Added a new style for the DOM formatter (not finished yet)

0.7.0 / 2009-02-27
------------------

  * Added Console formatter (anything implementing the console object. Firebug, Safari 4, etc)
  * Added JSpec.options.profile for optional profiling of specs
  * Added this. literal alternative (view readme)
  * Moved formatters into JSpec.formatters 
  * Added error() util
  * Added savings raketask
  * Fixed parse error bug in Safari 4

0.6.3 / 2009-02-26
------------------

  * Added minification for jspec.jquery.js when packaging before release
  * Added compression of css when packaging before release

0.6.2 / 2009-02-26
------------------

  * Changed; using $ in jspec.jquery.js for JSpec, take that jQuery ;)
  * Added addMatchers, print, hash, and each as 'utility functions' this allows 
  JSpec to do each(...) internally instead of JSpec.each(...), while still preventing
  pollution of the global scope.

0.6.1 / 2009-02-26
------------------

  * Added closrue literal -{ (view README)
  * Added option to DOM formatter, now allows you to specify which element id to output to

0.6.0 / 2009-02-24
------------------

  * Added JSpec.hash 
  * Added be_null matcher
  * Allow recursive composite matching using should_eql and should_not_eql
  For example [1, 2, [3]].should_eql([1, 2, [3]]) is true, works with object
  'hashes' as well.

0.5.1 / 2009-02-24
------------------

  * Damn auto-release messed up

0.5.0 / 2009-02-24
------------------

  * Added async support for jQuery
  * Added JSpec.requires for dependencies
  * Added JSpec.throw
  * Added JSpec.runSpec
  * Refactored jspec.jquery.js
  * Fixed evalBody exceptions, previously was not showing exception message
  * Fixed bug of JSpec interpreting // in a string such as http:// to be a comment.

0.4.1 / 2009-02-22
------------------

  * Added elements() alias of element()
  * Added support for string passed to runSuite; runSuite('Matchers') is the same as
  runSuite(JSpec.suites['Matchers']).
  * Fixed some documentation

0.4.0 / 2009-02-20
------------------

  * Added comment literal (//)
  * Added pre-processor for convering matchers.
  For example 'test'.should_be_true becomes JSpec.match('test', 'should_be', 'true'),
  preventing pollution of core prototypes.

0.3.2 / 2009-02-19
------------------

  * Added TM bundle (go checkout my jspec.tmbundle repo on github)
  * Renamed have_length_of to have_length

0.3.1 / 2009-02-19
------------------

  * Added jquery js to package

0.3.0 / 2009-02-19
------------------

  * Added JSpec.match
  * Added options to report() which are passed to formatter
  * Added sandbox helpers (reg / jquery)
  * Added have_child and have_children
  * Added have_tag and have_tags
  * Changed exec to only load / eval file
  * Fixed parser token issue, was previously matching things like end() as literal end

0.2.3 / 2009-02-18
------------------

  * Changed test dir to spec
  * Changed test.js to core.spec.js

0.2.2 / 2009-02-18
------------------

  * Added contexts

0.2.0 / 2009-02-18
------------------

  * Added release rake task
  * Added package with minified alternative

0.1.0 / 2009-02-18
------------------

  * Added new sexy syntax (warning: you will have to re-write your specs)
  * Added pre-processor for optional matcher parens 
  * Added several new matchers 
  * Added matcher aliasing 
  * Added simple matcher declarations 
  * Added __END__ 
  * Added yet-to-be-implemented specs 
  * Added loading of suites via JSpec.load

0.0.4 / 2008-11-03
------------------

  * Added ability to pass only a description to it(), meaning not yet implemented

0.0.3 / 2008-10-28
------------------

  * Added should_fail
  * Added should_match
  * Added should_not_match
  * Added should_be and should_not_be

0.0.2 / 2008-10-28
------------------

  * Fixed typo in documentation for pointing to the master repo

0.0.1 / 2008-10-28
------------------

  * Initial release
