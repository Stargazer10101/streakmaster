const Task = require('../models/Task');
const DateEntry = require('../models/DateEntry');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all tasks for a user
// @route   GET /api/tasks
// @access  Private
const getAllTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ user: req.user._id });
  res.json(tasks);
});

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
  const newTask = await Task.create({
    name: req.body.name,
    user: req.user._id
  });
  res.status(201).json(newTask);
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
  const taskId = req.params.id;
  const deletedTask = await Task.findOneAndDelete({ _id: taskId, user: req.user._id });
  
  if (!deletedTask) {
    return res.status(404).json({ error: 'Task not found' });
  }

  await DateEntry.deleteMany({ taskId, user: req.user._id });
  res.status(200).json({ message: 'Task deleted successfully' });
});

module.exports = {
  getAllTasks,
  createTask,
  deleteTask
}; 