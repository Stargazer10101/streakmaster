require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { body, validationResult } = require('express-validator');
const { query } = require('express-validator');

const app = express();
const port = process.env.PORT || 3000;

//app.use(cors());


// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Allow requests from the frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  credentials: true // Allow cookies (if needed)
}));


app.use(express.json());

const getFilePath = (id) => path.join(__dirname, `${id}_dates.json`);

const getDateFilePath = (taskId) => path.join(__dirname, `${taskId}_dates.json`);

const getDatesFromFile = async (filePath) => {
  try {
    await fs.access(filePath);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data) || [];
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

const saveDateToFile = async (filePath, date) => {
  const dates = await getDatesFromFile(filePath);
  if (!dates.includes(date)) {
    dates.push(date);
    await fs.writeFile(filePath, JSON.stringify(dates), 'utf8');
  }
};

const removeDateFromFile = async (filePath, date) => {
  const dates = await getDatesFromFile(filePath);
  console.log('Before removal:', dates);
  const updatedDates = dates.filter(d => d !== date);
  console.log('After removal:', updatedDates);
  await fs.writeFile(filePath, JSON.stringify(updatedDates), 'utf8');
};

app.get('/api/dates', 
  query('taskId').isString().notEmpty(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { taskId } = req.query;
      const filePath = getDateFilePath(taskId);
      const dates = await getDatesFromFile(filePath);

      res.json({ dates });
    } catch (error) {
      console.error('Error fetching dates:', error);
      res.status(500).json({ error: 'Failed to fetch dates' });
    }
});

app.post('/api/dates', 
  body('date').isISO8601().toDate(),
  body('taskId').isString().notEmpty(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { date, taskId } = req.body;
      const dateString = date.toISOString().split('T')[0]; // Convert to YYYY-MM-DD format
      console.log('Received request to update date:', dateString, 'for task:', taskId);
      const filePath = getDateFilePath(taskId);
      
      const dates = await getDatesFromFile(filePath);
      console.log('Current dates:', dates);
      const dateExists = dates.includes(dateString);
      
      if (dateExists) {
        console.log('Date exists, removing:', dateString);
        await removeDateFromFile(filePath, dateString);
      } else {
        console.log('Date does not exist, adding:', dateString);
        await saveDateToFile(filePath, dateString);
      }
      
      const updatedDates = await getDatesFromFile(filePath);
      console.log('Updated dates:', updatedDates);
      
      res.json({ dates: updatedDates });
    } catch (error) {
      console.error('Error updating dates:', error);
      res.status(500).json({ error: 'Failed to update dates' });
    }
});

// Helper function to get the tasks file path
const getTasksFilePath = () => path.join(__dirname, 'tasks.json');

// GET /api/tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasksFilePath = getTasksFilePath();
    const tasksData = await fs.readFile(tasksFilePath, 'utf8');
    const tasks = JSON.parse(tasksData);
    res.json(tasks);
  } catch (error) {
    console.error('Error reading tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /api/tasks
app.post('/api/tasks', body('name').notEmpty(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const tasksFilePath = getTasksFilePath();
    let tasks = [];
    try {
      const tasksData = await fs.readFile(tasksFilePath, 'utf8');
      tasks = JSON.parse(tasksData);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }

    const newTask = {
      id: Date.now().toString(),
      name: req.body.name,
      createdAt: new Date().toISOString()
    };

    tasks.push(newTask);
    await fs.writeFile(tasksFilePath, JSON.stringify(tasks, null, 2));
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// DELETE /api/tasks/:id
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    const tasksFilePath = getTasksFilePath();
    
    // Read existing tasks
    let tasks = [];
    try {
      const tasksData = await fs.readFile(tasksFilePath, 'utf8');
      tasks = JSON.parse(tasksData);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }

    // Find the index of the task to delete
    const taskIndex = tasks.findIndex(task => task.id === taskId);

    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Remove the task
    tasks.splice(taskIndex, 1);

    // Write updated tasks back to file
    await fs.writeFile(tasksFilePath, JSON.stringify(tasks, null, 2));

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
