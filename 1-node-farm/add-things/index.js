const http = require('http');
const url = require('url');
const fs = require('fs')
const request = require('request')
var FormData = require('form-data');
var jar = request.jar();
jar.setCookie(request.cookie("foo=bar"), "http://mockbin.com/request");
jar.setCookie(request.cookie("bar=baz"), "http://mockbin.com/request");
const tplIndex = fs.readFileSync(`${__dirname}/template-index.html`, 'utf-8');

const server = http.createServer( (req, res) => {
  const { query, pathname } = url.parse(req.url, true);
  const form = new FormData();
  var options = {
    method: 'POST',
    url: 'http://mockbin.com/request',
    qs: {foo: ['bar', 'baz']},
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'x-pretty-print': '2'
    },
    body: {foo: 'bar'},
    json: true,
    jar: 'JAR'
  };
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
  
    console.log(body);
  });
  if (pathname === '/') {
    //const listHtml = dataObj.map(el => replaceTemplate(tplCard, el)).join('');
    const listHtml = `<h1>Test</h1>`
    const output = tplIndex.replace('{%ITEMS%}', listHtml)
    res.writeHead(200, { 'Content-type': 'text/html' });
    return res.end(output);
  }
});

server.listen(5002, () => {
  console.log('Listening on 5002 -')
})