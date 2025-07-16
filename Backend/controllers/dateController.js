const fs = require('fs');
const path = require('path');
const asyncHandler = require('../middleware/asyncHandler');

const TASKS_FILE = path.join(__dirname, '../tasks.json');
const DATES_FILE = path.join(__dirname, '../1_dates.json');

function readTasks() {
  if (!fs.existsSync(TASKS_FILE)) return [];
  return JSON.parse(fs.readFileSync(TASKS_FILE, 'utf-8'));
}
function readDates() {
  if (!fs.existsSync(DATES_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATES_FILE, 'utf-8'));
}
function writeDates(dates) {
  fs.writeFileSync(DATES_FILE, JSON.stringify(dates, null, 2));
}

// @desc    Get dates for a task
// @route   GET /api/dates
// @access  Private
const getDatesForTask = asyncHandler(async (req, res) => {
  const { taskId } = req.query;
  const tasks = readTasks();
  const taskExists = tasks.some(t => t.id === taskId && t.user === req.user._id);
  if (!taskExists) {
    return res.json({ dates: [] });
  }
  const dates = readDates().filter(d => d.taskId === taskId && d.user === req.user._id);
  res.json({ dates: dates.map(d => d.date) });
});

// @desc    Add or remove a date for a task
// @route   POST /api/dates
// @access  Private
const addOrRemoveDate = asyncHandler(async (req, res) => {
  const { date, taskId } = req.body;
  const tasks = readTasks();
  const taskExists = tasks.some(t => t.id === taskId && t.user === req.user._id);
  if (!taskExists) {
    return res.status(404).json({ error: 'Task not found' });
  }
  let dates = readDates();
  const dateIndex = dates.findIndex(d => d.taskId === taskId && d.date === date && d.user === req.user._id);
  if (dateIndex !== -1) {
    dates.splice(dateIndex, 1); // Remove date
  } else {
    dates.push({ taskId, date, user: req.user._id }); // Add date
  }
  writeDates(dates);
  const updatedDates = dates.filter(d => d.taskId === taskId && d.user === req.user._id);
  res.json({ dates: updatedDates.map(d => d.date) });
});

module.exports = {
  getDatesForTask,
  addOrRemoveDate
}; 