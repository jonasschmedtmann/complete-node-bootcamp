const fs = require('fs')
const http = require('http')

////////////////////////////////////////
/// SERVER  
const PORT = 9912 
const URL = '127.0.0.1';

const server = http.createServer((req, res)=> {
    console.log(req)
    res.end(`Hello from http:localhost: Server`)
});

server.listen(PORT,URL, () => {
    console.log(`listing to requsert on port: http://${URL}:${PORT}`)
})  


// You stoped at video 9 Routing