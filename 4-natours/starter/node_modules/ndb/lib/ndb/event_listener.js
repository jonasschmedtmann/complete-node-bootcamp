var ndb = require("ndb"),
    sys = require("util");

exports.reset = function() {
  this.buffer = "";
};

exports.regexp = new RegExp("Content-Length: \\d+\r\n\r\n");

exports.receive = function(str, __json_callback) {
  var puts       = ndb.Helpers.puts,
      log        = ndb.Helpers.log,
      prompt     = ndb.Helpers.prompt,
      replPrompt = ndb.Helpers.replPrompt,
      verbose    = ndb.verbose,
      regexp     = this.regexp,
      message,
      message_body,
      content_length,
      json,
      result,
      object,
      i;

  if (verbose) {
    log(str, "verbose: <<< ");
  }

  this.buffer += str;

  do {
    message        = ndb.MessageParser.parse(this.buffer);
    content_length = message.headers["Content-Length"];

    if (content_length && message.body.length >= parseInt(content_length, "10")) {
      message_body = message.body.substr(0, content_length);

      if (content_length > 0) {
        try {
          json = JSON.parse(message_body);

          if (__json_callback) {
            __json_callback(json);
          }

          for (i in ndb.Commands) {
            object = ndb.Commands[i];

            if (object.parseResponse) {
              result = object.parseResponse(json);

              if (result) {
                result.output(json);

                if (ndb.State.replOn) {
                  replPrompt();
                } else {
                  prompt();
                }
              }
            }
          }
        } catch (e) {
          sys.puts("");
          sys.puts("");
          sys.puts("ERROR: "          + sys.inspect(e));
          sys.puts("BUFFER: "         + this.buffer);
          sys.puts("content length: " + content_length);
          sys.puts("message body: "   + message_body);
          sys.puts("");
          sys.puts("");
          sys.puts("");
        }
      }

      this.buffer = this.buffer.replace(message.raw_headers + "\r\n" + message_body, "");
    } else {
      break;
    }
  } while (true)
};
