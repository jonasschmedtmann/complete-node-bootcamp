const fs = require('fs');

const tours = JSON.parse(fs.readFileSync('./dev-data/data/tours-simple.json'));

exports.getUsersName = (req, res) => {
  console.log('hello');
  const users = tours.map((item) => item.name);
  res.status(200).json({
    users,
  });
};

exports.getUserNameByID = (req, res) => {
  const user = tours.filter((item) => +req.params.id === item.id)[0].name;
  res.status(200).json({
    name: user,
  });
};
