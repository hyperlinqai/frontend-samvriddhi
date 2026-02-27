const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.get('/', requireAuth, requireRole(['admin']), reportsController.getReports);

module.exports = router;
