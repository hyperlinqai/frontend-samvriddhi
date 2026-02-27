const express = require('express');
const router = express.Router();
const cspController = require('../controllers/cspController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.get('/', requireAuth, requireRole(['admin', 'manager']), cspController.getCSPManagement);

module.exports = router;
