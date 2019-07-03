const fs = require('fs')
const http = require('http')
const url = require('url')


////////////////////////////////////////////
//Files

//Blocking, synchronous way
// const textInput = fs.readFileSync('./starter/txt/input.txt', 'utf-8')
// console.log(textInput)

// const textOutput = `this is what we know about the avocado: ${textInput}. \nCreated on ${Date.now()}`
// fs.writeFileSync('./starter/txt/output.txt', textOutput)

// console.log('File written')

//non-blocking, asyncronous way
// fs.readFile('./starter/txt/start.txt', 'utf-8', (err, data1) => {
//   if (err) return console.log('ERROR!')
//   fs.readFile(`./starter/txt/${data1}.txt`, 'utf-8', (err, data2) => {
//     console.log(data2)
//     fs.readFile(`./starter/txt/append.txt`, 'utf-8', (err, data3) => {
//       console.log(data3)
//       fs.writeFile('./starter/txt/final.txt', `${data2}\n${data3}`, 'utf-8', err => {
//         console.log('Your file has been written.👍')
//       })
//     })
//   })
// })
// console.log('will read file!')

////////////////////////////////////////////
//Server

const data = fs.readFileSync(`${__dirname}/starter/dev-data/data.json`, 'utf-8')
const dataObj = JSON.parse(data)

const server = http.createServer((req, res) => {
  const pathName = req.url
  if(pathName === '/' || pathName === '/overview') {
    res.end('This is the overview')
  } else if (pathName === '/product') {
    res.end('This is the product')
  } else if (pathName === '/api') {
    res.end(data)
    
  } else {
    res.writeHead(404, {
      'Content-type': 'text/html',
      'my-own-header': 'hello-world'
    })
    res.end('<h1>Page not found.</h1>')
  }
  // res.end('Hello from the server!')
})

server.listen(8000, '127.0.0.1', () => {
  console.log('Listening to Requests on port 8000')
})