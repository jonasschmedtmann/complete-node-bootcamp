const fs = require("fs");

// blocking sync way
// const textIn = fs.readFileSync(".//txt//output.txt", "utf-8")
// console.log(textIn)
// const textOut = `nice feature for es6 like python ${textIn}.\nCreated on ${Date.now()}`;
// fs.writeFileSync(".//txt//output.txt", textOut)

// non-blocking, async way --> callback HELL!
fs.readFile("./txt/start.txt", "utf-8", (err, data) => {
    fs.readFile(`./txt/${data}.txt`, "utf-8", (err, data2) => {
        console.log(data2);
        fs.readFile("./txt/append.txt", "utf-8", (err, data3) => {
            console.log(data3);
            fs.writeFile("./txt/final.txt", `${data2}\n${data3}`, "utf-8", (err) => {
                console.log("Your file is being written :)");
            });
        });
    });
    console.log(data);
});

console.log("Will Read File!")