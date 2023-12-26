exports.parse = function(text) {
  var lines             = text.split("\r\n"),
      done_with_headers = false,
      header,
      value,
      i;

  var obj = {
    headers: {},
    body: "",
    raw_headers: ""
  };

  lines.forEach(function(line) {
    if (done_with_headers === true) {
      obj.body += line;
    } else if (line === "") {
      done_with_headers = true;
    } else {
      i = line.indexOf(":");
      header = line.slice(0, i);
      value = line.slice(i+1, line.length).trimLeft();

      obj.raw_headers += line + "\r\n";
      obj.headers[header] = value;
    }
  });

  return obj;
};
