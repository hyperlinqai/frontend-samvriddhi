const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/', requireAuth, attendanceController.getAttendance);

module.exports = router;
