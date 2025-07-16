const fs = require('fs');
const path = require('path');
const asyncHandler = require('../middleware/asyncHandler');

const TASKS_FILE = path.join(__dirname, '../tasks.json');
const DATES_FILE = path.join(__dirname, '../1_dates.json');

function readTasks() {
  if (!fs.existsSync(TASKS_FILE)) return [];
  return JSON.parse(fs.readFileSync(TASKS_FILE, 'utf-8'));
}
function writeTasks(tasks) {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
}
function readDates() {
  if (!fs.existsSync(DATES_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATES_FILE, 'utf-8'));
}
function writeDates(dates) {
  fs.writeFileSync(DATES_FILE, JSON.stringify(dates, null, 2));
}

// @desc    Get all tasks for a user
// @route   GET /api/tasks
// @access  Private
const getAllTasks = asyncHandler(async (req, res) => {
  const tasks = readTasks().filter(t => t.user === req.user._id);
  res.json(tasks);
});

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
  const tasks = readTasks();
  const newTask = {
    id: Date.now().toString(),
    name: req.body.name,
    user: req.user._id,
    createdAt: new Date().toISOString()
  };
  tasks.push(newTask);
  writeTasks(tasks);
  res.status(201).json(newTask);
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
  const taskId = req.params.id;
  let tasks = readTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId && t.user === req.user._id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  tasks.splice(taskIndex, 1);
  writeTasks(tasks);
  // Remove associated dates
  let dates = readDates();
  dates = dates.filter(d => d.taskId !== taskId || d.user !== req.user._id);
  writeDates(dates);
  res.status(200).json({ message: 'Task deleted successfully' });
});

module.exports = {
  getAllTasks,
  createTask,
  deleteTask
}; 