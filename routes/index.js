const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const rmRoutes = require('./rmRoutes');
const cspRoutes = require('./cspRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const expenseRoutes = require('./expenseRoutes');
const reportsRoutes = require('./reportsRoutes');
const settingsRoutes = require('./settingsRoutes');

router.use('/', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/rm', rmRoutes);
router.use('/csp', cspRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/expenses', expenseRoutes);
router.use('/reports', reportsRoutes);
router.use('/settings', settingsRoutes);

router.get('/', (req, res) => {
    res.redirect('/login');
});

module.exports = router;
