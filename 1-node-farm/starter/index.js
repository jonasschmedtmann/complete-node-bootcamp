const fileSystem = require('fs');
const http = require('http');

/*const welcome ='Welcome to Node JS';

console.log(welcome);*/

/*
//Blocking, synchronous way
const textVal = fileSystem.readFileSync('./txt/input.txt', 'utf-8');
//if we don't mention the character encoding - we get a buffer instead of text

const ourText = `Here is some content from input.txt - ${textVal}. Generated on ${Date.now()}`;

fileSystem.writeFileSync('./txt/output.txt', ourText);

const fromOutputFile = fileSystem.readFileSync('./txt/output.txt', 'utf-8');

console.log(fromOutputFile);
*/


//Non-blocking, Asynchronous way
/*
fileSystem.readFile('./txt/start.txt', 'utf-8', (err, data)=>{
    if(err) return console.log('ERROR!');
    
    fileSystem.readFile(`./txt/${data}.txt`, 'utf-8', (err, data1)=>{
            console.log(data1);
        fileSystem.readFile(`./txt/append.txt`, 'utf-8', (err, data2)=>{
            console.log(data2);
            
            fileSystem.writeFile('./txt/final.txt', `${data1}\n${data2}`, 'utf-8', (err)=>{
                if(!err){
                    console.log('success');
                }
            });
        });
    });
}); //readFile method takes a call back as the third argument
   console.log('this prints before the data from start.txt file');

*/

///////////////////////////
//SERVER
http.createServer((req, res)=>{
    res.end(`Hello from the server! Here is your path - ${req.url}`);
}).listen(8000, '127.0.0.1', ()=>{ //port, host is current computer
    console.log('listening to requests on port 8000');
});
