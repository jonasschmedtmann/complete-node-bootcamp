const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello from server-side', app: 'natours' });
});

app.post('/', (req, res) => {
  res.send('you can post her to his Endpoint');
});

const port = 3000;
app.listen(port, () => {
  console.log(`App running on http://127.0.0.1:${port}...`);
});
