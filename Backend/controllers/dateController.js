const Task = require('../models/Task');
const DateEntry = require('../models/DateEntry');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get dates for a task
// @route   GET /api/dates
// @access  Private
const getDatesForTask = asyncHandler(async (req, res) => {
  const { taskId } = req.query;
  
  const taskExists = await Task.exists({ _id: taskId, user: req.user._id });
  if (!taskExists) {
    return res.json({ dates: [] });
  }

  const dates = await DateEntry.find({ taskId, user: req.user._id }).select('date -_id');
  res.json({ dates: dates.map(d => d.date) });
});

// @desc    Add or remove a date for a task
// @route   POST /api/dates
// @access  Private
const addOrRemoveDate = asyncHandler(async (req, res) => {
  const { date, taskId } = req.body;

  const taskExists = await Task.exists({ _id: taskId, user: req.user._id });
  if (!taskExists) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const existingDate = await DateEntry.findOne({ taskId, date, user: req.user._id });
  
  if (existingDate) {
    await DateEntry.deleteOne({ _id: existingDate._id });
  } else {
    await DateEntry.create({ taskId, date, user: req.user._id });
  }
  
  const updatedDates = await DateEntry.find({ taskId, user: req.user._id }).select('date -_id');
  res.json({ dates: updatedDates.map(d => d.date) });
});

module.exports = {
  getDatesForTask,
  addOrRemoveDate
}; 