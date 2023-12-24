const fs = require("fs");
const http = require("http");
const url = require("url");
const replaceTemplate = require("./modules/replaceTemplate")

//////////////////////////////////////////////////////////////////////////////////////
// FILES

// blocking sync way
// const textIn = fs.readFileSync(".//txt//output.txt", "utf-8")
// console.log(textIn)
// const textOut = `nice feature for es6 like python ${textIn}.\nCreated on ${Date.now()}`;
// fs.writeFileSync(".//txt//output.txt", textOut)

// non-blocking, async way --> callback HELL!
// fs.readFile("./txt/start.txt", "utf-8", (err, data) => {
//     fs.readFile(`./txt/${data}.txt`, "utf-8", (err, data2) => {
//         console.log(data2);
//         fs.readFile("./txt/append.txt", "utf-8", (err, data3) => {
//             console.log(data3);
//             fs.writeFile("./txt/final.txt", `${data2}\n${data3}`, "utf-8", (err) => {
//                 console.log("Your file is being written :)");
//             });
//         });
//     });
//     console.log(data);
// });

// console.log("Will Read File!")


//////////////////////////////////////////////////////////////////////////////////////
// SERVER

// const replaceTemplate = (temp, prd) => {
//     let output = temp.replace(/{%PRODUCTNAME%}/g, prd.productName);
//     output = output.replace(/{%PRICE%}/g, prd.price);
//     output = output.replace(/{%IMAGE%}/g, prd.image);
//     output = output.replace(/{%QUANTITY%}/g, prd.quantity);
//     output = output.replace(/{%PRODUCTID%}/g, prd.id);
//     output = output.replace(/{%SOURCEDFROM%}/g, prd.from);
//     output = output.replace(/{%NUTRIENTS%}/g, prd.nutrients);
//     output = output.replace(/{%DESCRIPTION%}/g, prd.description);
//     if (!prd.organic) {
//         output = output.replace(/{%NOT_ORGANIC%}/g, 'not-organic');
//     }
//     return output;
// }

// read data
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8", (err, data) => { });
const dataObj = JSON.parse(data);

// read template pages
const templateCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, "utf-8", (err, data) => { });
const templateOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, "utf-8", (err, data) => { });
const templatePrd = fs.readFileSync(`${__dirname}/templates/template-product.html`, "utf-8", (err, data) => { });


const server = http.createServer((req, resp) => {
    const { query, pathname } = url.parse(req.url, true);
    // overview
    if (pathname === "/" || pathname === "/overview") {
        resp.writeHead(200, { "content-type": "text/html" });
        const cardsHtml = dataObj.map(el => replaceTemplate(templateCard, el)).join('');
        const output = templateOverview.replace(/{%PRODUCT_CARDS%}/g, cardsHtml);
        resp.end(output);
    }
    else if (pathname === "/product") {
        const prd = dataObj[query.id];
        resp.writeHead(200, { "content-type": "text/html" });
        const output = replaceTemplate(templatePrd, prd);
        resp.end(output);
    }
    else {
        resp.writeHead(404, {
            "Content-type": "text/html",
            "my-own-header": "my head hurts"
        });
        resp.end("<h1>Whoops baby what did you do?</h1>");
    }



    // products





    // api





    // not found - 404

    // console.log(req.url)
    // console.log(req);
});

server.listen(8000, "127.0.0.1", () => {
    // console.log("listening to requests on port 8000")
});

