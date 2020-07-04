// const fs = require('fs');

// setTimeout(() => console.log('Timer 1 finished!'), 0);
// setImmediate(() => console.log('Immediate 1 finished!'));

// fs.readFile('test-file.txt', () => {
//     console.log('I/O finished!');
// });

// console.log('Hello from the top-level code!');

//************************************************************ */

const fs = require('fs');
const crypto = require('crypto');

const start = Date.now();
process.env.UV_THREADPOOL_SIZE = 1;  // limits to one threadpool

setTimeout(() => console.log('Timer 1 finished!'), 0);
setImmediate(() => console.log('Immediate 1 finished!'));

fs.readFile('test-file.txt', () => {
    console.log('I/O finished!');
    console.log('---------------------------------------');

    setTimeout(() => console.log('Timer 2 finished!'), 0);    
    setTimeout(() => console.log('Timer 3 finished!'), 3000);
    setImmediate(() => console.log('Immediate 2 finished!'));

    process.nextTick(() => console.log('Process nextTick1!'));
    process.nextTick(() => console.log('Process nextTick2!'));
    process.nextTick(() => console.log('Process nextTick3!'));
    process.nextTick(() => console.log('Process nextTick4!'));
    process.nextTick(() => console.log('Process nextTick5!'));
    process.nextTick(() => console.log('Process nextTick6!'));

    crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
        console.log(Date.now() - start, 'Password encrypted!');
    });
    crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
        console.log(Date.now() - start, 'Password encrypted!');
    });
    crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
        console.log(Date.now() - start, 'Password encrypted!');
    });
    crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
        console.log(Date.now() - start, 'Password encrypted!');
    });
});

console.log('Hello from the top-level code!');