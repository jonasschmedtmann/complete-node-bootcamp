const fs = require('fs');   //requires the file_system module

// BLOCKING, SYNCHRONOUS WAY
// read files
// const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');
// console.log(textIn);
// // write files
// const textOut = `This is what we know about the avocado: ${textIn}. \nCreated on ${Date.now()}`;
// fs.writeFileSync('./txt/output.txt', textOut);
// console.log("File written!");

// NON-BLOCKING, ASYNCHRONOUS WAY
fs.readFile('./txt/startt.txt', 'utf-8', (err, data1) => {
    if (err) return console.log('Error! 🤮');
    fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
        console.log(data2);
        if (err) return console.log('Error2! 🥵');
        fs.readFile('./txt/append.txt', 'utf-8', (err, data3) => {
            console.log(data3);
            if (err) return console.log('Error3! 🤬');
            fs.writeFile('./txt/final.txt', `${data2}\n${data3}`, 'utf-8', err => {
                console.log('Your file has been written ');
            });
        }); 
    }); 
}); 
console.log('Will read file!');