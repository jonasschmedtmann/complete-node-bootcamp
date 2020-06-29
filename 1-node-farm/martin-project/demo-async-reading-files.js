const fs = require('fs');

const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');
const textOut = `This is what we know about the Avo:  ${textIn}. Created on ${Date.now()}`;

// Blocking
// fs.writeFileSync('./txt/output.txt', textOut)

// Non-blocking reading / writing a file. Works in the background
fs.writeFile('./txt/output.txt', textOut, 'utf-8', (e) => {
  //console.log('completed write')
})

fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
  if( err) return console.log('Error!', err)
  console.log(data1)
   fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
      console.log('read', data2) 
      fs.readFile(`./txt/append.txt`, 'utf-8', (err, data3) => {
        console.log('read', data3) 
        fs.writeFile(`./txt/appendedFinal.txt`, `${data2}\n${data3}`, 'utf-8', (err) => { 
          console.log('File written') 
        })
      })
    })
})

console.log('🥑 Working...');