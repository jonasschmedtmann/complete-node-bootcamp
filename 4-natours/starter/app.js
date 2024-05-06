const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.status(200).json({ message: 'She yleo', app: 'Igriale  ' });
});
app.post('/', (req,res) => {
    res.status(404).send('You can post on this endpoint...')
})

const port = 3000;
app.listen(port, () => {
  console.log(`app running on port: ${port}`);
});
