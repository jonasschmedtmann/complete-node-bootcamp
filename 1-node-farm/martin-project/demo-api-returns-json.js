const fs = require('fs');
const http = require('http');
const url = require('url');

/* Server */

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);

const server =
  http.createServer((req, res) => {
    const pathName = req.url;
    res.writeHead(200, { 'Content-type': 'text/html' })
    if ( pathName === '/overview' || pathName === '/' ){
         res.end('<h2>Overview</h2>')
      } else if ( pathName === '/product'){
        res.end('<h2>Product</h2>')
    } else if ( pathName === '/api' ) { 
      console.log('API!');
      res.writeHead(200, { 'Content-type': 'application/json' })
      console.log(data)
      res.end(data);
    } else {
      // Send HTML
      res.writeHead(404, { 'Content-type': 'text/html' })
      res.end('<h2>Page not found</h2>')
    }
  })

server.listen(5000, () => {
  console.log('Server running on 5000')
})


/* Files */