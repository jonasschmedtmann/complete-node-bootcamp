const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const app = require('./app');

//Start server
const port = process.env.port || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
