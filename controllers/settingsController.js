const { getApiClient } = require('../utils/apiClient');

// GET /settings — List all users with optional filters
exports.getUsers = async (req, res, next) => {
    try {
        const api = getApiClient(req);
        const { search, role, page } = req.query;

        // Build query params
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (role) params.append('role', role);
        params.append('page', page || '1');
        params.append('limit', '20');

        const [usersRes, rolesRes, entitiesRes] = await Promise.all([
            api.get(`/v1/users?${params.toString()}`),
            api.get('/v1/roles?limit=100'),
            api.get('/v1/entities?limit=100')
        ]);

        let users = [];
        let roles = [];
        let entities = [];
        let meta = { total: 0, page: 1, totalPages: 1 };

        if (usersRes.data.success) {
            users = usersRes.data.data || [];
            meta = usersRes.data.meta || meta;
        }
        if (rolesRes.data.success) roles = rolesRes.data.data || [];
        if (entitiesRes.data.success) entities = entitiesRes.data.data || [];

        res.render('pages/settings-users', {
            title: 'User Management',
            users,
            roles,
            entities,
            meta,
            filters: { search: search || '', role: role || '' },
            user: req.user,
            success: req.query.success || null,
            error: req.query.error || null
        });
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.render('pages/settings-users', {
            title: 'User Management',
            users: [],
            roles: [],
            entities: [],
            meta: { total: 0, page: 1, totalPages: 1 },
            filters: { search: '', role: '' },
            user: req.user,
            success: null,
            error: error.response?.data?.message || 'Failed to load users.'
        });
    }
};

// POST /settings/users — Create a new user via admin endpoint
exports.createUser = async (req, res) => {
    try {
        const api = getApiClient(req);
        const { fullName, email, phone, password, roleId, entityId, reportingTo } = req.body;

        await api.post('/v1/users', {
            fullName,
            email,
            phone,
            password,
            roleId,
            entityId: entityId ? entityId : undefined,
            reportingTo: reportingTo ? reportingTo : undefined
        });

        res.redirect('/settings?success=User created successfully');
    } catch (error) {
        console.error('Error creating user:', error.message);
        const errorMsg = error.response?.data?.message || 'Failed to create user.';
        res.redirect(`/settings?error=${encodeURIComponent(errorMsg)}`);
    }
};

// POST /settings/users/:userId/edit — Update user details
exports.updateUser = async (req, res) => {
    try {
        const api = getApiClient(req);
        const { userId } = req.params;
        const { fullName, phone, roleId, entityId, reportingTo, isActive } = req.body;

        const updateData = {};
        if (fullName) updateData.fullName = fullName;
        if (phone) updateData.phone = phone;
        if (roleId) updateData.roleId = roleId;
        updateData.entityId = entityId ? entityId : null;
        updateData.reportingTo = reportingTo ? reportingTo : null;
        if (typeof isActive !== 'undefined') {
            updateData.isActive = isActive === 'true' || isActive === true;
        }

        await api.patch(`/v1/users/${userId}`, updateData);

        res.redirect('/settings?success=User updated successfully');
    } catch (error) {
        console.error('Error updating user:', error.message);
        const errorMsg = error.response?.data?.message || 'Failed to update user.';
        res.redirect(`/settings?error=${encodeURIComponent(errorMsg)}`);
    }
};

// POST /settings/users/:userId/delete — Hard delete user with fallback to soft delete
exports.deleteUser = async (req, res) => {
    try {
        const api = getApiClient(req);
        const { userId } = req.params;

        try {
            // First attempt to hard delete the user
            await api.delete(`/v1/users/${userId}/hard`);
            return res.redirect('/settings?success=User deleted successfully');
        } catch (hardDeleteError) {
            // If hard delete fails (likely due to foreign key constraints from associated records),
            // fallback to soft delete (deactivate)
            console.log(`Hard delete failed for user ${userId}, falling back to soft delete. Error: ${hardDeleteError.message}`);
            
            await api.delete(`/v1/users/${userId}`);
            return res.redirect('/settings?success=User deactivated because they have associated records');
        }
    } catch (error) {
        console.error('Error deleting user:', error.message);
        const errorMsg = error.response?.data?.message || 'Failed to delete or deactivate user.';
        res.redirect(`/settings?error=${encodeURIComponent(errorMsg)}`);
    }
};

// ─── Entity Management ──────────────────────────────────

// GET /settings/entities — List all entities
exports.getEntities = async (req, res) => {
    try {
        const api = getApiClient(req);
        const { search, status, page } = req.query;

        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (status) params.append('status', status);
        params.append('page', page || '1');
        params.append('limit', '20');

        const response = await api.get(`/v1/entities?${params.toString()}`);
        let entities = [];
        let meta = { total: 0, page: 1, totalPages: 1 };

        if (response.data.success !== false) {
            entities = response.data.data || [];
            meta = response.data.meta || meta;
        }

        res.render('pages/settings-entities', {
            title: 'Entity Management',
            entities,
            meta,
            filters: { search: search || '', status: status || '' },
            user: req.user,
            success: req.query.success || null,
            error: req.query.error || null
        });
    } catch (error) {
        console.error('Error fetching entities:', error.message);
        res.render('pages/settings-entities', {
            title: 'Entity Management',
            entities: [],
            meta: { total: 0, page: 1, totalPages: 1 },
            filters: { search: '', status: '' },
            user: req.user,
            success: null,
            error: error.response?.data?.message || 'Failed to load entities.'
        });
    }
};

// POST /settings/entities — Create a new entity
exports.createEntity = async (req, res) => {
    try {
        require('fs').appendFileSync('frontend_trace.log', `[${new Date().toISOString()}] CREATE ROUTE HIT with body: ${JSON.stringify(req.body)}\n`);
        const api = getApiClient(req);
        const { name, code } = req.body;

        await api.post('/v1/entities', { name, code: code.toUpperCase() });

        res.redirect('/settings/entities?success=Entity created successfully');
    } catch (error) {
        console.error('Error creating entity:', error.message);
        const errorMsg = error.response?.data?.message || 'Failed to create entity.';
        res.redirect(`/settings/entities?error=${encodeURIComponent(errorMsg)}`);
    }
};

// POST /settings/entities/:id/edit — Update entity
exports.updateEntity = async (req, res) => {
    try {
        require('fs').appendFileSync('frontend_trace.log', `[${new Date().toISOString()}] EDIT ROUTE HIT for ID ${req.params.id} with body: ${JSON.stringify(req.body)}\n`);
        const api = getApiClient(req);
        const { id } = req.params;
        const { name, code, status } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (code) updateData.code = code.toUpperCase();
        if (typeof status !== 'undefined') {
            updateData.status = status === 'true' || status === true;
        }

        await api.patch(`/v1/entities/${id}`, updateData);

        res.redirect('/settings/entities?success=Entity updated successfully');
    } catch (error) {
        console.error('Error updating entity:', error.message);
        const errorMsg = error.response?.data?.message || 'Failed to update entity.';
        res.redirect(`/settings/entities?error=${encodeURIComponent(errorMsg)}`);
    }
};

// POST /settings/entities/:id/deactivate — Soft-delete entity (using PATCH to avoid 403 for SM_ADMIN)
exports.deactivateEntity = async (req, res) => {
    try {
        require('fs').appendFileSync('frontend_trace.log', `[${new Date().toISOString()}] DEACTIVATE ROUTE HIT for ID ${req.params.id}\n`);
        const api = getApiClient(req);
        const { id } = req.params;

        await api.patch(`/v1/entities/${id}`, { status: false });

        res.redirect('/settings/entities?success=Entity deactivated successfully');
    } catch (error) {
        console.error('Error deactivating entity:', error.message);
        const errorMsg = error.response?.data?.message || 'Failed to deactivate entity.';
        res.redirect(`/settings/entities?error=${encodeURIComponent(errorMsg)}`);
    }
};

// POST /settings/entities/:id/delete — Hard-delete entity
exports.deleteEntity = async (req, res) => {
    try {
        require('fs').appendFileSync('frontend_trace.log', `[${new Date().toISOString()}] DELETE ROUTE HIT for ID ${req.params.id}\n`);
        const api = getApiClient(req);
        const { id } = req.params;

        require('fs').appendFileSync('delete_trace.log', `[${new Date().toISOString()}] Attempting DELETE /v1/entities/${id}/hard\n`);
        const response = await api.delete(`/v1/entities/${id}/hard`);
        require('fs').appendFileSync('delete_trace.log', `[${new Date().toISOString()}] Success response from API: ${response.status}\n`);

        res.redirect('/settings/entities?success=Entity deleted permanently');
    } catch (error) {
        require('fs').writeFileSync('delete_error.log', JSON.stringify({
            message: error.message,
            response: error.response?.data || 'No response data'
        }, null, 2));
        console.error('Error deleting entity:', error.message);
        const errorMsg = error.response?.data?.message || 'Failed to delete entity. You may need Super Admin privileges.';
        res.redirect(`/settings/entities?error=${encodeURIComponent(errorMsg)}`);
    }
};

// ══════════════════════════════════════════════
// ROLE & PERMISSION MANAGEMENT
// ══════════════════════════════════════════════

// GET /settings/roles — List all roles and permissions
exports.getRoles = async (req, res) => {
    try {
        const api = getApiClient(req);

        // Fetch roles, all system permissions, and entities concurrently
        const [rolesRes, permsRes, entitiesRes] = await Promise.all([
            api.get('/v1/roles?limit=100'),
            api.get('/v1/roles/permissions'),
            api.get('/v1/entities?limit=100') // to populate entity assignment dropdown
        ]);

        let roles = [];
        let permissions = [];
        let entities = [];

        if (rolesRes.data.success) roles = rolesRes.data.data || [];
        if (permsRes.data.success) permissions = permsRes.data.data || [];
        if (entitiesRes.data.success) entities = entitiesRes.data.data || [];

        res.render('pages/settings-roles', {
            title: 'Role & Permission Management',
            user: req.user,
            roles,
            permissions,
            entities,
            success: req.query.success || null,
            error: req.query.error || null
        });
    } catch (error) {
        console.error('Error fetching roles:', error.message);
        res.render('pages/settings-roles', {
            title: 'Role & Permission Management',
            user: req.user,
            roles: [],
            permissions: [],
            entities: [],
            error: error.response?.data?.message || 'Failed to load roles and permissions.',
            success: null
        });
    }
};

// POST /settings/roles — Create a new role
exports.createRole = async (req, res) => {
    try {
        const api = getApiClient(req);
        const { name, level, entityId, permissions } = req.body;

        let permArray = [];
        if (permissions) {
            permArray = Array.isArray(permissions) ? permissions : [permissions];
        }

        await api.post('/v1/roles', {
            name,
            level: parseInt(level, 10),
            entityId: entityId || undefined,
            permissions: permArray
        });

        res.redirect('/settings/roles?success=Role created successfully');
    } catch (error) {
        console.error('Error creating role:', error.message);
        const errorMsg = error.response?.data?.message || 'Failed to create role.';
        res.redirect(`/settings/roles?error=${encodeURIComponent(errorMsg)}`);
    }
};

// POST /settings/roles/:id/edit — Update role and permissions
exports.updateRole = async (req, res) => {
    try {
        const api = getApiClient(req);
        const { id } = req.params;
        const { name, level, entityId, permissions } = req.body;

        let permArray = [];
        if (permissions) {
            permArray = Array.isArray(permissions) ? permissions : [permissions];
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (level) updateData.level = parseInt(level, 10);
        updateData.entityId = entityId ? entityId : null;
        updateData.permissions = permArray;

        await api.patch(`/v1/roles/${id}`, updateData);

        res.redirect('/settings/roles?success=Role updated successfully');
    } catch (error) {
        console.error('Error updating role:', error.message);
        const errorMsg = error.response?.data?.message || 'Failed to update role.';
        res.redirect(`/settings/roles?error=${encodeURIComponent(errorMsg)}`);
    }
};

// POST /settings/roles/:id/delete — Delete role
exports.deleteRole = async (req, res) => {
    try {
        const api = getApiClient(req);
        const { id } = req.params;

        await api.delete(`/v1/roles/${id}`);

        res.redirect('/settings/roles?success=Role deleted successfully');
    } catch (error) {
        console.error('Error deleting role:', error.message);
        const errorMsg = error.response?.data?.message || 'Failed to delete role.';
        res.redirect(`/settings/roles?error=${encodeURIComponent(errorMsg)}`);
    }
};
