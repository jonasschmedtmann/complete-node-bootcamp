const express = require('express');

const app = express();
const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello World!', app: 'Natours' });
});

app.post('/', (req, res) => {
  res.send('you can post to this endpoint...');
});
