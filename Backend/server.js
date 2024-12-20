require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { body, validationResult, query, param } = require('express-validator');
const mongoose = require('mongoose');
const { protect } = require('./middleware/authMiddleware');
const authRoutes = require('./routes/authRoutes');

const app = express();
const port = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Define schemas
const TaskSchema = new mongoose.Schema({
  name: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const DateSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  date: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
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

// Auth routes
app.use('/api/auth', authRoutes);

// Protected routes
// GET /api/dates
app.get('/api/dates', 
  protect,
  query('taskId').isString().notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { taskId } = req.query;
      
      const taskExists = await Task.exists({ _id: taskId, user: req.user._id });
      if (!taskExists) {
        return res.json({ dates: [] });
      }

      const dates = await DateEntry.find({ taskId, user: req.user._id }).select('date -_id');
      res.json({ dates: dates.map(d => d.date) });
    } catch (error) {
      console.error('Error fetching dates:', error);
      res.status(500).json({ error: 'Failed to fetch dates' });
    }
});

// POST /api/dates
app.post('/api/dates', 
  protect,
  body('date').matches(/^\d{4}-\d{2}-\d{2}$/),
  body('taskId').isString().notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { date, taskId } = req.body;
      console.log('Received request:', { date, taskId });

      const taskExists = await Task.exists({ _id: taskId, user: req.user._id });
      if (!taskExists) {
        return res.status(404).json({ error: 'Task not found' });
      }

      const existingDate = await DateEntry.findOne({ taskId, date, user: req.user._id });
      
      if (existingDate) {
        await DateEntry.deleteOne({ _id: existingDate._id });
        console.log('Deleted existing date');
      } else {
        await DateEntry.create({ taskId, date, user: req.user._id });
        console.log('Created new date');
      }
      
      const updatedDates = await DateEntry.find({ taskId, user: req.user._id }).select('date -_id');
      console.log('Sending response:', { dates: updatedDates.map(d => d.date) });
      res.json({ dates: updatedDates.map(d => d.date) });
    } catch (error) {
      console.error('Error updating dates:', error);
      res.status(500).json({ error: 'Failed to update dates', details: error.message });
    }
});

// GET /api/tasks
app.get('/api/tasks', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id });
    res.json(tasks);
  } catch (error) {
    console.error('Error reading tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /api/tasks
app.post('/api/tasks', protect, body('name').notEmpty(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const newTask = await Task.create({ 
      name: req.body.name,
      user: req.user._id
    });
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// DELETE /api/tasks/:id
app.delete('/api/tasks/:id', 
  protect,
  param('id').isMongoId(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const taskId = req.params.id;
      const deletedTask = await Task.findOneAndDelete({ _id: taskId, user: req.user._id });
      
      if (!deletedTask) {
        return res.status(404).json({ error: 'Task not found' });
      }

      await DateEntry.deleteMany({ taskId, user: req.user._id });

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

process.on('SIGINT', () => {
  console.log('Shutting down server...');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});