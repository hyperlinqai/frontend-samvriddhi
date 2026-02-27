const express = require('express');
const router = express.Router();
const rmController = require('../controllers/rmController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.get('/', requireAuth, requireRole(['admin', 'manager']), rmController.getRMManagement);

module.exports = router;
