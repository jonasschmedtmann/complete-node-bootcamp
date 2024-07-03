const EventEmitter = require("events")
const htttp = require('http')

class Sales extends EventEmitter{
    constructor() {
        super()
    }
}
const myemitter = new EventEmitter

myemitter.on('newSale', () => {
    console.log("There was a new sale!")
})

myemitter.on('newSale', () => {
    console.log('Customer name : Jonas')
})

myemitter.on('newSale', stock => {
    console.log(`There are now ${stock} items left in stock`)
})
myemitter.emit('newSale', 9)

// 
const server = htttp.createServer()

server.on('request', (req, res) => {
    console.log('Request received')
    res.end('Request received')
})

server.on('request', (req, res) => {
    console.log('Another Request received')
})

server.on('close', () => {
    console.log('Server closed')
})

server.listen(8000, '127.0.0.1', () => {
    console.log("Waiting for requests...")
})