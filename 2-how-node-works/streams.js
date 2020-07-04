const fs = require('fs');
const server = require('http').createServer();

server.on('request', (req, res) => {
    // //Solution 1  - works but will crash if large files
    // fs.readFile('test-file.txt', (err, data) => {
    //     if (err) console.log(err);
    //     res.end(data);
    // });

    // //Solution 2 - Backpressure (respond can't send as fast as it is received)
    // const readable = fs.createReadStream('test-file.txt');
    // readable.on('data', chunk => {
    //     res.write(chunk);
    // });
    // readable.on('end', () => {
    //     res.end();
    // });
    // readable.on('error', err => {
    //     console.log(err);
    //     res.statusCode =500;
    //     res.end("File not found!");
    // });

    //Solution3 - use pipes
    //// Need a readable stream and pipe into a writeable destination
    //// readableSource.pipe(writeableDest);
    const readable = fs.createReadStream('test-file.txt');
    readable.pipe(res);
});

    
server.listen(5500, '127.0.0.1', () => {
    console.log("Listening......");
});