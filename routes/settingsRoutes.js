const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// All settings routes require admin role
router.use(requireAuth, requireRole([
    'admin', 'SUPER_ADMIN', 'Super Admin', 'SM_ADMIN',
    'superadmin', 'SuperAdmin', 'super_admin', 'SUPER ADMIN'
]));

// User management
router.get('/', settingsController.getUsers);
router.post('/users', settingsController.createUser);
router.post('/users/:userId/edit', settingsController.updateUser);
router.post('/users/:userId/delete', settingsController.deleteUser);

// Entity management
router.get('/entities', settingsController.getEntities);
router.post('/entities', settingsController.createEntity);
router.post('/entities/:id/edit', settingsController.updateEntity);
router.post('/entities/:id/deactivate', settingsController.deactivateEntity);
router.post('/entities/:id/delete', settingsController.deleteEntity);

// Role & Permission management
router.get('/roles', settingsController.getRoles);
router.post('/roles', settingsController.createRole);
router.get('/roles/:id/edit', settingsController.getEditRolePage);
router.post('/roles/:id/edit', settingsController.updateRole);
router.post('/roles/:id/delete', settingsController.deleteRole);

module.exports = router;
