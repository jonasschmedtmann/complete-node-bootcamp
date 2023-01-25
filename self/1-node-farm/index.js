const fs = require('fs');
const http=require('http');
const textIn = fs.readFileSync('./starter/txt/input.txt', 'utf-8');
// console.log(textIn);

// const newe=`My room number is ${textIn}./n created on${Date.now()}`;
// fs.writeFileSync('./starter/txt/output.txt',newe);
// console.log('file written');

//async behaviour making
fs.readFile('./starter/txt/start.txt', 'utf-8', (err, data) => {

    if(err)
    {
        return console.log("error aa gaya");
    }
    fs.readFile(`./starter/txt/${data}.txt`, 'utf-8', (err, data2) => {
        fs.readFile(`./starter/txt/append.txt`, 'utf-8', (err, data3) => {
            fs.writeFile(`./starter/txt/final.txt`, `${data2}\n${data3}`, 'utf-8', (err) => {

                console.log("your file has been written");
            });


            console.log(data3);

        });

        console.log(data2);
    });
    console.log(data);

});

console.log("asyn calling");

// as we can se ein the terminal the call back function is called back later after the excetution of the cosole.log 


////////////////////////////////
//server

const server=http.createServer((req,res)=>{
res.end("hello from rishabh");
}
);
server.listen(8000,'127.0.0.1',()=>{
    console.log("listening to port 8000");
});

