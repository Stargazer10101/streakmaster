require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { body, validationResult, query, param } = require('express-validator');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);  // Exit the process with failure
  });

// Define schemas
const TaskSchema = new mongoose.Schema({
  name: String,
  createdAt: { type: Date, default: Date.now }
});

const DateSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  date: String
});

// Define models
const Task = mongoose.model('Task', TaskSchema);
const DateEntry = mongoose.model('DateEntry', DateSchema);

// CORS and JSON middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// GET /api/dates
app.get('/api/dates', 
  query('taskId').isString().notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { taskId } = req.query;
      
      // Check if the task exists
      const taskExists = await Task.exists({ _id: taskId });
      if (!taskExists) {
        return res.json({ dates: [] }); // Return an empty array if task doesn't exist
      }

      const dates = await DateEntry.find({ taskId }).select('date -_id');
      res.json({ dates: dates.map(d => d.date) });
    } catch (error) {
      console.error('Error fetching dates:', error);
      res.status(500).json({ error: 'Failed to fetch dates' });
    }
});

// POST /api/dates
app.post('/api/dates', 
  body('date').matches(/^\d{4}-\d{2}-\d{2}$/),  // Validate YYYY-MM-DD format
  body('taskId').isString().notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { date, taskId } = req.body;
      const dateString = date;  // No need to convert, it's already in the right format
      
      const existingDate = await DateEntry.findOne({ taskId, date: dateString });
      
      if (existingDate) {
        await DateEntry.deleteOne({ _id: existingDate._id });
      } else {
        await DateEntry.create({ taskId, date: dateString });
      }
      
      const updatedDates = await DateEntry.find({ taskId }).select('date -_id');
      res.json({ dates: updatedDates.map(d => d.date) });
    } catch (error) {
      console.error('Error updating dates:', error);
      res.status(500).json({ error: 'Failed to update dates' });
    }
});

// GET /api/tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
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
    const newTask = await Task.create({ name: req.body.name });
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// DELETE /api/tasks/:id
app.delete('/api/tasks/:id', 
  param('id').isMongoId(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const taskId = req.params.id;
      const deletedTask = await Task.findByIdAndDelete(taskId);
      
      if (!deletedTask) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Also delete associated dates
      await DateEntry.deleteMany({ taskId });

      res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  }
);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
