const fs = require("fs");
const http = require("http");

const server = http.createServer();

//Without Streams
// server.on("request", (req, res) => {
//   fs.readFile("test-file.txt", (error, data) => {
//     if (error) {
//       console.log(error);
//     }
//     res.write(data);
//   });
// });

//With Streams
// server.on("request", (req, res) => {
//   const readableStream = fs.createReadStream("test-file.txt");
//   readableStream.on("data", (chunk) => {
//     res.write(chunk);
//   });

//   readableStream.on("end", () => {
//     res.end();
//   });
//   readableStream.on("err", () => {
//     res.end("Error");
//   });
// });

//With Streams and Pipe
// ReadableResource.pipe(WritableResource)
server.on("request", (req, res) => {
  const readableStream = fs.createReadStream("test-file.txt");
  readableStream.pipe(res);
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Listening.............");
});
