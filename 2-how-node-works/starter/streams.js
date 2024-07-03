const fs = require('fs')
const server = require('http').createServer()
server.on('request', (req, res) => {

    // solution1
    fs.readFile('test-file.txt', (err,data) => {
        if(err) console.log(err);
        res.end(data)
    })

    // Solution2

//     const readable = fs.createReadStream('test-file.txt')
//     readable.on('data', chunk => {
//         res.write(chunk)
//     })

//     readable.on('end', () => {
//         res.end()
//     })

//     readable.err('error', err => {
//         console.log(err)
//         res.statusCode = 500
//         res.end("file not found")
//     })

// Solution 3
const readable = fs.createReadStream('test-file.txt')
readable.pipe(res);
// readablesource.pipe(writeableDestination)


 })

server.listen(8000, '127.0.0.1', () => {
    console.log("Listening.....")
})