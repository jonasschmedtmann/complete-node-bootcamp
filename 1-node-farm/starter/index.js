const fs = require("fs");
const { dirname } = require("path");
const http = require("http");
const url = require("url");

////////////////////////FILES/////////////////////////////

//Synchronous (waits for one result before executing next one) - Blocking
/*const txtIn = fs.readFileSync(__dirname + "/txt/input.txt", "utf-8");
console.log(txtIn);
const textOut = `This is what we know about the avocado: ${txtIn}\nCreated ${Date.now()}`;
fs.writeFileSync(__dirname + "/txt/output.txt", textOut);
console.log("File Written");*/

//Asynchronous - Non Blocking - (starts reading the file in the background and immediatly goes to the next function)
/*fs.readFile(__dirname + "/txt/sstart.txt", "utf-8", (err, data1) => {
    if(err) console.log('ERROR 💥');

  fs.readFile(__dirname + `/txt/${data1}.txt`, "utf-8", (err, data2) => {
    console.log(data2);
    fs.readFile(__dirname + `/txt/append.txt`, "utf-8", (err, data3) => {
      console.log(data3);

      fs.writeFile("txt/final.txt", `${data2}\n${data3}`, "utf-8", (err) => {
        console.log("Your file has been written! 🔅");
      });
    });
  });
});
console.log("Will read file!");
*/

//////////////////////////SERVER///////////////////////
const server = http.createServer((req, res) => {
  console.log(req.url); // http://127.0.0.1:8000/overview?id=12&abc=567 req.url=/overview?id=12&abc=567

  const pathName = req.url;

  if (pathName === "/" || pathName === "/overview") {
    res.end("This is the Overview");
  } else if (pathName === "/product") {
    res.end("This is the Product");
  } else {
    res.writeHead(404, {
      "Content-type": "text.html",
      'my-own-header': 'hello-world'
    }); //appears in the network tab
    //Response headers must be always set up before sending the response
    //They provide you more information about response (eg: location or server providing it) 
    res.end("<h1>Page not found!</h1>");
  }
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Listening to requests on port 8000");
});

//Routing - implementing different actions for different URL (eg: localhost:8000/products)
//We can use Express dependency to do it
