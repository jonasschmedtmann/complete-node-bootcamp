const fs = require('fs');
const { resolve } = require('path');
const superagent = require('superagent')

const readFilePro = file => {
    return new Promise((resolve, reject) => {
        fs.readFile(file, (err, data) => {
            if (err) reject('I could not find the file! ❌')
            resolve(data);
        });
    });
};

const writeFilePro = (file, data) => {
    return new Promise((rseolve, reject)=>{
        fs.writeFile(file, data, err =>{
            if (err) reject('Could not write file! ❌')
            resolve('success');
        })
    })
}

readFilePro(`${__dirname}/dog.txt`)
.then(data =>{
    console.log(`Breed: ${data}`);
    return superagent.get(`https://dog.ceo/api/breed/${data}/images/random`)
})
       
.then(res => {
    console.log(res.body.message);
    return writeFilePro('dog-image.txt', res.body.message)
    })
    .then(() =>{
        console.log('Random Dog Image')
    })
    .catch(err =>{
        console.log(err.message) ;
    });



//old 
// .then(res => {
//     console.log(res.body.message);
//     return writeFilePro('dog-image.txt', res.body.message)

//         //     fs.writeFile('dog-image.txt', res.body.message, err => {
//         //         console.log('Random Dog Image')
//         //     });
//     })
        

//old
// fs.readFile(`${__dirname}/dog.txt`, (err, data)=> {
//     console.log(`Breed: ${data}`);

// superagent
//     .get(`https://dog.ceo/api/breed/${data}/images/random`)
//     .then(res => {
//         console.log(res.body.message);

//         fs.writeFile('dog-image.txt', res.body.message, err => {
//             console.log('Random Dog Image')
//         });
//     })
//     .catch(err =>{
//         console.log(err.message) ;
//     })
// });


