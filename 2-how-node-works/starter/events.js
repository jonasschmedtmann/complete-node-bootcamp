const eventEmitter = require('events');
const http = require('http');

class Sale extends eventEmitter {
    constructor(){
        super();
    }
}

const myEmitter = new Sale();

myEmitter.on('newSale',(num)=>{
    console.log(`newSale emitter is emitted ${num}`);
})

myEmitter.emit('newSale', 5);

////////
const server = http.createServer();

server.on('request', (req, res)=>{
    res.end('recieved a new request from you');
    console.log('recieved a new request from you');
    console.log(req.url);
});

server.on('close', ()=>{
    console.log('server is now closed');
});

server.listen(8000, '127.0.0.1', ()=>{
    console.log('waiting for requests');
});

server.close();