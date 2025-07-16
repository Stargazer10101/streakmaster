require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { body, validationResult, query, param } = require('express-validator');
const { protect } = require('./middleware/authMiddleware');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const dateRoutes = require('./routes/dateRoutes');

const app = express();
const port = process.env.PORT || 3000;

// CORS and JSON middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dates', dateRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});