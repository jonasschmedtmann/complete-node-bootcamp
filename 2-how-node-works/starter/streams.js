const fs = require("fs");
const server = require("http").createServer();

server.on("request", (req, res) => {
  //Solution 1 - because the file i too big or there aremany requests it will take too much time to read
  //   fs.readFile("test-file.txt", (err, data) => {
  //     if (err) console.log(err);
  //     res.end(data);
  //   });

  //Solution 2 //piece is sent to client piece by piece
  //PROBLEM
  //Back Pressure - happens when the response cannot send the data as fast as it is receiving it from the file
  // const readable = fs.createReadStream("test-file.txt");
  // readable.on("data", (chunk) => {
  //     res.write(chunk);
  // });

  // //Always need to use the end event to let the client know all the data has been read
  // readable.on("end", () => {
  //     res.end();
  // });
  // //Catch the error
  // readable.on("error", (err) => {
  //     console.log(err);
  //     res.statusCode = 500;
  //     res.end("File not found");
  // });

  //Solution 3 - pipe operator will allow us to pipe the output of a readable stream to an input of a writable stream
  const readable = fs.createReadStream("test-file.txt");
  readable.pipe(res);
  //readableSource.pipe(writableDestination)
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Listening");
});
