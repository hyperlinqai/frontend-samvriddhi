const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');

// Public routes
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/logout', authController.getLogout);
router.get('/forgot-password', authController.getForgotPassword);
router.post('/forgot-password', authController.postForgotPassword);

// Authenticated routes
router.get('/change-password', requireAuth, authController.getChangePassword);
router.post('/change-password', requireAuth, authController.postChangePassword);
router.get('/profile', requireAuth, authController.getProfile);
router.get('/notifications', requireAuth, authController.getNotifications);

module.exports = router;
