const EventEmitter = require('events');

const myEmitter = new EventEmitter();

myEmitter.on('newSale', () => {
    console.log('There was a new sale!!');
})

myEmitter.on('newSale', () => {
    console.log('Customer is Fortune');
});

myEmitter.on('newSale', stock => {
    console.log(`There are now ${stock} left in our inventory`);
})

myEmitter.emit("newSale", 9);

