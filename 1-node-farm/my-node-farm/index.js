const fs = require("fs");

// Blocking, synchronous way
// const textIn = fs.readFileSync("./txt/input.txt", "utf-8");
// const textOut = `Hello, let me tell you all about the avocado! ${textIn}`;
// fs.writeFileSync("./txt/output.txt", textOut);
// console.log("File was written!");

// Non-blocking, asynchronous way with callbacks
// aka CALLBACK HELL!!!
fs.readFile("./txt/starttttt.txt", "utf-8", (err, data1) => {
  if (err) return console.log(err);
  fs.readFile(`./txt/${data1}.txt`, "utf-8", (err, data2) => {
    console.log(data2);
    fs.readFile(`./txt/append.txt`, "utf-8", (err, data3) => {
      console.log(data3);
      fs.writeFile("./txt/final.txt", `${data2}\n${data3}`, "utf-8", (err) => {
        console.log("File has been written!");
      });
    });
  });
});
console.log("Will read file!");
