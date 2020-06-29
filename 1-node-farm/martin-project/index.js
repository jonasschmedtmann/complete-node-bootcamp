const fs = require('fs');
const http = require('http');
const url = require('url');
const replaceTemplate = require('./modules/replaceTemplate');
const slugify = require('slugify');

/* Server */

const tplOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
const tplProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');
const tplCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);

// Create slugs from data
const slugs = dataObj.map(el => slugify(el.productName, { lower: true }));

const server =
  http.createServer((req, res) => {

    // Get query from the url
    const { query, pathname } = url.parse(req.url, true);
    res.writeHead(200, { 'Content-type': 'text/html' });

    // Overview
    if (pathname === '/overview' || pathname === '/') {
      // Generate HTML from json data - replace template HTML with values in data
      const cardsHtml = dataObj.map(el => replaceTemplate(tplCard, el)).join('');
      const output = tplOverview.replace('{%PRODUCT_CARDS%}', cardsHtml)
      return res.end(output)

    } else if (pathname === '/product') {
      const product = dataObj[query.id];
      const output = replaceTemplate(tplProduct, product);
      return res.end(output);
    } else if (pathname === '/api') {
      console.log('API!');
      res.writeHead(200, { 'Content-type': 'application/json' });
      res.end(data);
    } else {
      // Send HTML
      res.writeHead(404, { 'Content-type': 'text/html' });
      res.end('<h2>Page not found</h2>')
    }
  })

server.listen(5000, () => {
  console.log('Server running on 5000')
})
