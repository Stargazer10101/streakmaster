const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/', (req, res) => {
  const { date } = req.body;
  if (!date) {
    return res.status(400).send('Date is required');
  }

  console.log(`Received date: ${date}`);
  res.status(200).send({ message: 'Date received successfully', date });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
