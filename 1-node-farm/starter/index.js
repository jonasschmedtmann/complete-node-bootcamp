const replaceTemplate = require('./modules/replaceTemplate');
const http = require('http');
const url = require('url');
const fs = require('fs');

/*
 * Server
 */
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const productData = JSON.parse(data);
const templateOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  'utf-8'
);
const templateCard = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  'utf-8'
);
const templateProduct = fs.readFileSync(
  `${__dirname}/templates/product.html`,
  'utf-8'
);

const server = http.createServer((req, res) => {
  console.info(req.url);
  const { query, pathname } = url.parse(req.url, true);

  if (pathname === '/' || pathname === '/overview') {
    // Overview page
    res.writeHead(200, {
      'Content-type': 'text/html',
    });

    const cardsHtml = productData
      .map((product) => replaceTemplate(templateCard, product))
      .join('');
    const overview = templateOverview.replace(/{%productCards%}/g, cardsHtml);

    res.end(overview);
  } else if (pathname === '/product') {
    // Product page
    res.writeHead(200, {
      'Content-type': 'text/html',
    });

    const product = productData[query.id];
    const productHtml = replaceTemplate(templateProduct, product);

    res.end(productHtml);
  } else if (pathname === '/api') {
    // API
    res.writeHead(200, {
      'Content-type': 'application/json',
    });
    res.end(data);
  } else {
    res.writeHead(404, {
      'Content-type': 'text/html',
      'my-own': 'test',
    });
    res.end('<h1>Page not found</h1>');
  }
});

server.listen(8000, '127.0.0.1', () => {
  console.info('Listening to requests on port 8000');
});
