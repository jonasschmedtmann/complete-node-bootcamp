// promise.all()
// usefull for aggrigating the results of multiple promises
// Return a single promise that fulfills when all of the promise
// passed to it have been fulfilled.
// it reject with the reason 
// of the first promise that rejects or with the errors
// caught by the first argument, if the argument has cauht an error inside it
// using try/catch/throw blocks.

let p1 = new Promise((resolve, reject) => {
    setTimeout(resolve, 2000, "hello")
})

let p2 = new Promise((resolve, reject) => {
    setTimeout(resolve, 2000, "world")
})

let p3 = 1000

Promise.all([p1, p2, p3]).then((result) => {
    console.log(result)
}).catch(err => {
    console.error('Catch: ', err)
})


// Promise.race()
// Return a promise that fulfuills or rejects as soon as one of the 
// Promises in an iterable fulfills or rejects, with the value or 
// reason from the rpromise.

