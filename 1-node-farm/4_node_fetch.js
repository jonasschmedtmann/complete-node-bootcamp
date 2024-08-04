// real world example using nod-fetch
import fetch from "node-fetch";

const url = "https://jsonplaceholder.typicode.com/todos/1";

fetch(url)
  .then(isStatus200)
  .then(getPost)
  .then((json) => console.log(json))
  .catch((err) => console.log(err));

function isStatus200(res) {
  if (res.status === 200) {
    return res;
  } else {
    let err = new Error(res.statusText);
    err.response = res;
    throw err;
  }
}

function getPost(res) {
  return res.json();
}
