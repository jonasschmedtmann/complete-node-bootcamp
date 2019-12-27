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

  // Streams
  const readAble = fs.createReadStream("test-file.txt");

  // This will read the data from the file in chuncks(peice by peice) needs data and end
  readAble.on("data", chunk => {
    res.write(chunk);
  });

  // To call after the sream is finished needs data and end
  readAble.on("end", () => {
    res.end();
  });

  readAble.on("error", err => {
    console.log(err);
    res.statusCode = 500;
    res.end("file not found");
    // YOU STOPED At Streams Practice
  });
});

server.listen(port, serverHost, () => {
  console.log(`running on http://${serverHost}:${port}`);
});
