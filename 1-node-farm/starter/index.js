const fs = require('fs');
const http = require('http');

//Blocking, synchronous code execution
// const textIN = fs.readFileSync('./txt/input.txt', 'utf-8');
// console.log(textIN);

// const textOut = `This is what we know about the avacado 🥑: ${textIN}.\nCreated on ${Date.now()}`;
// fs.writeFileSync('./txt/output.txt', textOut);
// console.log('File Written');


// //Non-blocking, asynchronous
// fs.readFile('./txt/start.txt',  'utf-8', (err, data1) =>{
//     fs.readFile(`./txt/${data1}.txt`,  'utf-8', (err, data2) =>{
//         console.log(data2);
//         fs.readFile(`./txt/append.txt`,  'utf-8', (err, data3) =>{
//             console.log(data3);
            
//             fs.writeFile('./txt/final.txt', `${data2}\n${data3}`,'utf-8', err =>{
//                     console.log('Your file has been written :)');
//             })
//            });
//        });
// });
// console.log('Will read!!');

////////////////////////////////
//FILES


////////////////////////////////
//SERVER
const server = http.createServer(
    (req, res)=>{
        res.end('Hello from the server!');
    });
server.listen(8000, '127.0.0.1', () => {
    console.log('Listening on requests on port 8000');
});
