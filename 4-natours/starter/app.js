const fs = require('fs');
const express = require('express');
const app = express();

app.use(express.json());

// app.get('/', (req, res) => {
//   res.status(200).json({ message: 'She yleo', app: 'Igriale  ' });
// });
// app.post('/', (req,res) => {
//     res.status(404).send('You can post on this endpoint...')
// })

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

app.get('/api/v1/tours/:id', (req, res) => {
  console.log(req.params);
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);
  const len = tours.length;

  if (len < id) {
    return res.status(404).json({
      status: 'chajma',
      message: 'igriale she yleo shen',
    });
  }

  res.status(200).json({
    data: {
      tour,
    },
  });
});

app.post('/api/v1/tours', (req, res) => {
  //   console.log(req.body);
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
});

const port = 3000;
app.listen(port, () => {
  console.log(`app running on port: ${port}`);
});
