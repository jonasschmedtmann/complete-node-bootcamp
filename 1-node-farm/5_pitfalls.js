// real world example using nod-fetch
import fetch from "node-fetch";

const url = "https://jsonplaceholder.typicode.com/todos/1";

function isStatus200(res) {
  console.log("Checking HTTP response status...");
  if (res.status === 200) {
    return res;
  } else {
    let err = new Error(res.statusText);
    err.response = res;
    throw err;
  }
}

function getPost(res) {
    setTimeout(() => {
          console.log("Getting Json ... ");
          return res.json();
    }, 3000)
}

function getTitlte(post) {
  console.log("Getting Title....");
  return post;
}

function echoTitle(title) {
  console.log("title");
}
// Bad news not returning, nesting and not catching
fetch(url)
  .then(isStatus200 )
  .then(result => {
    console.log("Got a result ...");
    getPost(result)
})
.then(post => getTitlte(post))
.then((title) => echoTitle(title));
 
// Better news - terminate cahin with catch, fltten
// fetch(url)
//   .then(isStatus200 )
//   .then((result) => {
//     console.log("Getting Result ...");
//     return getPost(result);
//   })
//   .then(getTitlte)
//   .then(echoTitle)
//   .catch((err) => console.log(err));
