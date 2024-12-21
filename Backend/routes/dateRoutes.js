const express = require('express');
const router = express.Router();
const { query, body } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const { getDatesForTask, addOrRemoveDate } = require('../controllers/dateController');

// @route   GET /api/dates
router.get('/', protect, query('taskId').isString().notEmpty(), getDatesForTask);

// @route   POST /api/dates
router.post('/', 
  protect,
  body('date').matches(/^\d{4}-\d{2}-\d{2}$/),
  body('taskId').isString().notEmpty(),
  addOrRemoveDate
);

module.exports = router; 