// let's create several function that return promise
// and look at promise changing

// simulate feaching some data
let feachdata = function (data) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("Feaching data complete");
      resolve({ id: 1, message: "nice work" });
    }, 2000);
  });
};

// parse the data
let parseData = function (data) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let parseOutPut = `parse the data for id: ${data.id} with message ${data.message}`;
      resolve({ parsed: parseOutPut });
    }, 2000);
  });
};

// echo data
let echoData = function (data) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log(data.parsed);
    });
  });
};

// changeing the promise
feachdata()
  .then(parseData)
  .then(echoData)
  .catch((err) => {
    console.error("catch", err);
  });
