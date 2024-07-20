const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const getFilePath = (id) => path.join(__dirname, `${id}_dates.json`);

const getDatesFromFile = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data) || [];
  } catch (error) {
    console.error('Error reading file:', error);
    return [];
  }
};

const saveDateToFile = (filePath, fullDate) => {
  const dates = getDatesFromFile(filePath);
  dates.push(fullDate);
  try {
    fs.writeFileSync(filePath, JSON.stringify(dates), 'utf8');
  } catch (error) {
    console.error('Error writing file:', error);
  }
};

const removeDateFromFile = (filePath, fullDate) => {
  const dates = getDatesFromFile(filePath).filter(date => date !== fullDate);
  try {
    fs.writeFileSync(filePath, JSON.stringify(dates), 'utf8');
  } catch (error) {
    console.error('Error writing file:', error);
  }
};

app.get('/', (req, res) => {
  const { id } = req.query;
  console.log(`Received GET request with id: ${id}`);
  if (!id) {
    console.log('ID is required');
    return res.status(400).send('ID is required');
  }

  const filePath = getFilePath(id);
  const dates = getDatesFromFile(filePath);

  console.log(`Retrieved dates for ID: ${id}`, dates);
  return res.status(200).send({ dates });
});


app.post('/', (req, res) => {
  const { date, id } = req.body;
  console.log(`Received POST request with date: ${date} and id: ${id}`);
  if (!date || !id) {
    console.log('Date and ID are required');
    return res.status(400).send('Date and ID are required');
  }

  const filePath = getFilePath(id);
  const dates = getDatesFromFile(filePath);

  if (dates.includes(date)) {
    removeDateFromFile(filePath, date);
    console.log(`Removed date: ${date} for ID: ${id}`);
    return res.status(200).send({ message: 'Date removed successfully', dates: getDatesFromFile(filePath) });
  } else {
    saveDateToFile(filePath, date);
    console.log(`Saved date: ${date} for ID: ${id}`);
    return res.status(200).send({ message: 'Date saved successfully', dates: getDatesFromFile(filePath) });
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
