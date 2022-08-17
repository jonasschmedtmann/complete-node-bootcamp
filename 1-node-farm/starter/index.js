const fs = require("fs");
const http = require("http");
const url = require("url");
//
// // Blocking, scyncronus way
// const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');
// console.log(textIn);
// const textOut = `This is hat we know about the avocado ${textIn}.\nCreated on ${Date.now()}`;
// fs.writeFileSync('./txt/output.txt', textOut);
//

// Non-Blocking, asyncronous way

// fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
//     if (err) return console.log('Error reading file');
//     fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
//         console.log(data2);
//
//         fs.readFile(`./txt/append.txt`, 'utf-8', (err, data3) => {
//         console.log(data3);
//
//             fs.writeFile('./txt/final.txt',`${data2}\n${data3}`, 'utf-8', err => {
//             console.log('Your file has been written');
//             })
//         });
//     });
// });
//
// console.log('Will read this');

///////////////////////////////////////////////////////////////////////////////

// Server
//

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf8");
const dataObj = JSON.parse(data);

const server = http.createServer((req, res) => {
  const path = req.url;

  if (path === "/" || path === "/overview") {
    res.end("This is the overview");
  } else if (path === "/product") {
    res.end("This is the product");
  } else if (path === "/api") {
    res.writeHead(200, {
      "Content-type": "application/json",
    });
    res.end(data);
  } else {
    res.writeHead(404, {
      "Content-type": "text/html",
      "My-header": "Hello-world",
    });
    res.end("<h1>Page not found!</h1>");
  }
});

server.listen(3000, "127.0.0.1", () => {
  console.log("listneing to requests on port 3000");
});
