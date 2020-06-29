const fs = require('fs');
const http = require('http');
const url = require('url');

/* Server */

const server =
  http.createServer((req, res) => {
    const pathName = req.url;

    console.log(pathName)
    res.writeHead('404', { 'Content-type': 'text/html' })
    if ( pathName === '/overview'){
        return res.end('<h2>Overview</h2>')
    } else if ( pathName === '/product'){
      res.end('<h2>Product</h2>')
    }
    // Send HTML
    res.writeHead('404', { 'Content-type': 'text/html' })
    res.end('<h2>Page not found</h2>')
  })

server.listen(5000, () => {
  console.log('Server running on 5000')
})


/* Files */