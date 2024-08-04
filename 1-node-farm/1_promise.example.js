let allGood = true;

// Define a promise
// A Promise can be in one of three status;
// Pending:     |   hasn't settled to a value yet;
// Resolved:    |   settled sucessfully(calling: resolve())
// Rejected :   |   settled unsucessfully(calling: reject())

let fechData = new Promise((resolve, reject) => {
  if (allGood) {
    reject("error feching data");
  } else {
    resolve({
      id: 1,
      message: "nice work",
    });
  }
});

// Consuming the promise
fechData
  .then((fech) => {
    console.log("then", fech); 
  })
  .catch((err) => {
    console.error("catch", err);
  });
