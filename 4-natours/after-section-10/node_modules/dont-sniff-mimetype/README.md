"Don't infer the MIME type" middleware
======================================
[![Build Status](https://travis-ci.org/helmetjs/dont-sniff-mimetype.svg?branch=master)](https://travis-ci.org/helmetjs/dont-sniff-mimetype)

Some browsers will try to "sniff" mimetypes. For example, if my server serves *file.txt* with a *text/plain* content-type, some browsers can still run that file with `<script src="file.txt"></script>`. Many browsers will allow *file.js* to be run even if the content-type isn't for JavaScript.

Browsers' same-origin policies generally prevent remote resources from being loaded dangerously, but vulnerabilities in web browsers can cause this to be abused. Some browsers, like [Chrome](https://developers.google.com/web/updates/2018/07/site-isolation), will further isolate memory if the `X-Content-Type-Options` header is seen.

There are [some other vulnerabilities](http://miki.it/blog/2014/7/8/abusing-jsonp-with-rosetta-flash/), too.

This middleware prevents Chrome, Opera 13+, IE 8+ and [Firefox 50+](https://bugzilla.mozilla.org/show_bug.cgi?id=471020) from doing this sniffing. The following example sets the `X-Content-Type-Options` header to its only option, `nosniff`:

```javascript
const nosniff = require('dont-sniff-mimetype')
app.use(nosniff())
```

[MSDN has a good description](http://msdn.microsoft.com/en-us/library/gg622941%28v=vs.85%29.aspx) of how browsers behave when this header is sent.
