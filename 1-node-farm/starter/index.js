const fs = require("fs");
// const hello = "hello world";
// // const textIn = fs.readFileSync("./txt/input.txt", "utf-8"); // readFileSync("./path","") takes two arguments, first one is reading file we want,second is character encoding
// //BLOCKING SYNCHRONOUS CODES LINES 4-10
// console.log(textIn);
// const textOut = `About avocado ${textIn}.\n Created on ${Date.now()}`;
// fs.writeFileSync("./txt/output.txt", textOut); // writeFileSync("./path","text") takes two arguments, first one  is the path to the file where the data will be written, second is the data that will be written to the file. if first data doesn't exist writeFileSync create a new file.
// const readTextOut = fs.readFileSync("./txt/output.txt", "utf-8");
// console.log(readTextOut);

// NON-BLOCKING ASYNCHRONOUS CODES
fs.readFile("./txt/start.txt", "utf-8", (err, data1) => {
  console.log(data1); // the output will be read-this
  fs.readFile(`./txt/${data1}.txt`, "utf-8", (err, data2) => {
    console.log(data2); // the output will be the content of read-this.txt
    fs.readFile("./txt/append.txt", "utf-8", (err, data3) => {
      console.log(data3); // the output will be the content of append.txt
      fs.writeFile("./txt/final.txt", `${data2}\n${data3}`, "utf-8", (err) => {
        console.log("Your file has been written"); // content of final.txt will be data2(content of read-this.txt)+data3(content of append.txt)
      });
    });
  });
});
console.log("will read file...");
