// const EventEmitter = require('events');
// // const myEmitter = new EventEmitter();

// class Sales extends EventEmitter {
//     constructor() {
//         super();
//     };
// };

// const myEmitter = new Sales();

// //Observer
// myEmitter.on('newSale', () => {
//     console.log('There was a new sale!');
// });

// //Observer
// myEmitter.on('newSale', () => {
//     console.log('Customer name: Jonas');
// });

// myEmitter.on('newSale', stock => {
//     console.log(`There are ${stock} items left in stock!`);
// });

// myEmitter.emit('newSale', 9);

//------------------------------------------------------------

const EventEmitter = require('events');
const http = require('http');

class Sales extends EventEmitter {
    constructor() {
        super();
    };
};

const myEmitter = new Sales();

//Observer
myEmitter.on('newSale', () => {
    console.log('There was a new sale!');
});

//Observer
myEmitter.on('newSale', () => {
    console.log('Customer name: Jonas');
});

myEmitter.on('newSale', stock => {
    console.log(`There are ${stock} items left in stock!`);
});

myEmitter.emit('newSale', 9);

//////////////////////////
const server = http.createServer();

server.on('request', (req, res) => {
    console.log("Request received1! 🤷‍♂️");
    console.log(req.url);
});
server.on('request', (req, res) => {
    console.log("Another Request received2! 😎😎");
});
server.on('request', (req, res) => {
    console.log("Request received3!   🐨🐨🐨");
});
server.on('close', () => {
    console.log("Server closed!  😬");
});

/////////////// start server///////////////
server.listen(5500, '127.0.0.1', () => {
    console.log('Waiting for requests .....🏄‍♂️');
});