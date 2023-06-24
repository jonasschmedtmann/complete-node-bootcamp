const fs = require('fs')

fs.readFile('./txt/input.txt', 'utf-8', (err, textIn)=>{
    console.info(textIn);
    fs.writeFile('./txt/output.txt', `This is what we know about avocado: ${textIn}.\nCreated on ${Date.now()}`, () =>{
        console.info('File written. ');
    });
});
