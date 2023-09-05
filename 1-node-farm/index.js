const fs = require("fs");
const http = require("http");

//////////////////////////////////////////////////
// FILES

// Blocking, synchronous way
// const textIn = fs.readFileSync("./starter/txt/input.txt", "utf-8");

// const textOut = `This is what we know about the avocado: ${textIn}.\n Created on ${Date.now()}`;

// fs.writeFileSync("./starter/txt/output.txt", textOut);
// console.log("File written");

// Non-blocking, asynchronous way
// fs.readFile("./starter/txt/start.txt", "utf-8", (err, data1) => {
//   fs.readFile(`./starter/txt/${data1}.txt`, "utf-8", (err, data2) => {
//     console.log(data2);
//     fs.readFile("./starter/txt/append.txt", "utf-8", (err, data3) => {
//       console.log(data3);

//       fs.writeFile(
//         "./starter/txt/final.txt",
//         `${data2}\n${data3}`,
//         "utf-8",
//         (err) => {
//           console.log("Your file is written");
//         }
//       );
//     });
//   });
// });

//////////////////////////////////////////////////////////////////
// SERVER

const server = http.createServer((req, res) => {
  console.log(req);
  res.end("Hello from the server!");
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Listening to requests on port 8000");
});
