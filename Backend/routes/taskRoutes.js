const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const { getAllTasks, createTask, deleteTask } = require('../controllers/taskController');

// @route   GET /api/tasks
router.get('/', protect, getAllTasks);

// @route   POST /api/tasks
router.post('/', protect, body('name').notEmpty(), createTask);

// @route   DELETE /api/tasks/:id
router.delete('/:id', protect, deleteTask);

module.exports = router; 