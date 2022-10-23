const fs = require('fs');

setTimeout(()=> console.log("Timer 1 finished"), 0);
setImmediate(()=> console.log("Immediate 1 finished"))

fs.readFile('test-file.txt', ()=>{
    console.log("I/O finished");
    console.log("------------");

    setTimeout(()=> console.log("Timer 2 finished"), 0);
    setTimeout(()=> console.log("Timer 3 finished"), 3000);
    setImmediate(()=> console.log("Immediate 2 finished")) ///// event loop waits

    process.nextTick(()=> console.log("Process.nextTick"));
})

console.log("Hello from the top-level code");

