const EventEmitter = require('events');

class Sales extends EventEmitter {
  constructor() {
    super();
  }
}
const myEmitter = new Sales();

myEmitter.on('newSale', () => {
  console.log('New sale event');
});

myEmitter.on('newSale', () => {
  console.log('New sale event 2');
});

myEmitter.emit('newSale');
