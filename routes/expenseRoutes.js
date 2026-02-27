const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/', requireAuth, expenseController.getExpenses);

module.exports = router;
