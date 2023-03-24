const fs = require("fs");
const crypto = require("crypto");

const start = Date.now();
//process.env.UV_THREADPOOL_SIZE = 1; //this changes the amount of threads. If only 1 thread (it takes longer)

//Not inside the event loop because they are not inside a callback function
setTimeout(() => console.log("Timer 1 finished"), 0);
setImmediate(() => console.log("Immediate 1 finished"));

fs.readFile("test-file.txt", () => {
  console.log("I/O Finished");
  console.log("---------------");

  //The main advantage to using setImmediate over setTimeout is setImmediate will always be executed before any timers if scheduled within an I/O cycle, independently of how many timers are present
  setTimeout(() => console.log("Timer 2 finished"), 0); //even tho the time is 0 only on the next loop it will be executed
  setTimeout(() => console.log("Timer 3 finished"), 3000);
  setImmediate(() => console.log("Immediate 2 finished")); //comes only after one event loop is done

  process.nextTick(() => console.log("Process.nextTick")); //comes before immediate because it is executed right before the next loop phase starts

  crypto.pbkdf2("password", "salt", 100000, 1024, "sha512", () => {
    console.log(Date.now() - start, "Password encrypted");
  });

  crypto.pbkdf2("password", "salt", 100000, 1024, "sha512", () => {
    console.log(Date.now() - start, "Password encrypted");
  });

  crypto.pbkdf2("password", "salt", 100000, 1024, "sha512", () => {
    console.log(Date.now() - start, "Password encrypted");
  });

  crypto.pbkdf2("password", "salt", 100000, 1024, "sha512", () => {
    console.log(Date.now() - start, "Password encrypted");
  });
});

console.log("Hello from the top level code"); //1st to be called because it's a top-level code
