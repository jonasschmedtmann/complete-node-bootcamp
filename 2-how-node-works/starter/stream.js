const fs = require("fs");
const server = require("http").createServer();
const severAddres = require("./server.js");

const { port, serverHost } = severAddres;

server.on("request", (req, res) => {
  // Solution 1

  //   fs.readFile("test-file.txt", (err, data) => {
  //     if (err) console.log(err);
  //     response.end(data);
  //   });

  // Streams Solution 2
  // const readAble = fs.createReadStream("test-fle.txt");

  // // This will read the data from the file in chuncks(peice by peice) needs data and end
  // readAble.on("data", chunk => {
  //   res.write(chunk);
  // });

  // // To call after the sream is finished needs data and end otherwise the res will not be sent to the user
  // readAble.on("end", () => {
  //   res.end();
  // });

  // readAble.on("error", err => {
  //   console.log(err);
  //   res.statusCode = 500;
  //   res.end("file not found");
  // });

  //  Solution 3
  const readAble = fs.createReadStream("test-file.txt");
  readAble.pipe(res);

  // readableSource.pipe(writableDestination)
});

server.listen(port, serverHost, () => {
  console.log(`running on http://${serverHost}:${port}`);
});
