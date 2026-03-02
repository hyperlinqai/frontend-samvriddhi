const { getApiClient } = require('../utils/apiClient');

// GET /settings — List all users with optional filters
exports.getUsers = async (req, res, next) => {
    try {
        const api = getApiClient(req);
        const { search, role, status, page } = req.query;

        // Build query params
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (role) params.append('role', role);
        if (status) {
            params.append('isActive', status);
        }
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
            filters: { search: search || '', role: role || '', status: status || '' },
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
            filters: { search: '', role: '', status: '' },
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
        const { fullName, email, phone, password, roleId, entityIds, reportingTo } = req.body;

        // Ensure entityIds is an array
        let entityIdArray = [];
        if (entityIds) {
            entityIdArray = Array.isArray(entityIds) ? entityIds : [entityIds];
        }

        await api.post('/v1/users', {
            fullName,
            email,
            phone,
            password,
            roleId,
            entityIds: entityIdArray.length > 0 ? entityIdArray : undefined,
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
        const { fullName, phone, roleId, entityIds, reportingTo, isActive } = req.body;

        const updateData = {};
        if (fullName) updateData.fullName = fullName;
        if (phone) updateData.phone = phone;
        if (roleId) updateData.roleId = roleId;

        if (entityIds) {
            updateData.entityIds = Array.isArray(entityIds) ? entityIds : [entityIds];
        } else {
            updateData.entityIds = [];
        }

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

// POST /settings/users/:userId/toggle-active — Toggle user active status
exports.toggleUserActive = async (req, res) => {
    try {
        const api = getApiClient(req);
        const { userId } = req.params;

        // Get current user status
        const { data: userData } = await api.get(`/v1/users/${userId}`);
        const currentStatus = userData.data.isActive;

        await api.patch(`/v1/users/${userId}`, {
            isActive: !currentStatus
        });

        const action = currentStatus ? 'deactivated' : 'activated';
        res.redirect(`/settings?success=User ${action} successfully`);
    } catch (error) {
        console.error('Error toggling user status:', error.message);
        const errorMsg = error.response?.data?.message || 'Failed to update user status.';
        res.redirect(`/settings?error=${encodeURIComponent(errorMsg)}`);
    }
};

// ─── Entity Management ──────────────────────────────────

// GET /settings/entities — List all entities
exports.getEntities = async (req, res) => {
    try {
        const api = getApiClient(req);
        const { search, status, page } = req.query;

        let entities = [];
        let meta = { total: 0, page: 1, totalPages: 1 };

        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (status) {
            params.append('status', status);
        } else {
            // Default to 'all' to show both active and inactive
            params.append('status', 'all');
        }
        params.append('page', page || '1');
        params.append('limit', '20');

        const response = await api.get(`/v1/entities?${params.toString()}`);
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

// POST /settings/entities/:id/reactivate — Reactivate entity
exports.reactivateEntity = async (req, res) => {
    try {
        const api = getApiClient(req);
        const { id } = req.params;

        await api.patch(`/v1/entities/${id}`, { status: true });

        res.redirect('/settings/entities?success=Entity reactivated successfully');
    } catch (error) {
        console.error('Error reactivating entity:', error.message);
        const errorMsg = error.response?.data?.message || 'Failed to reactivate entity.';
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

// GET /settings/roles/:id/edit — Render edit role page
exports.getEditRolePage = async (req, res) => {
    try {
        const api = getApiClient(req);
        const { id } = req.params;

        // Fetch required data in parallel
        const [roleResponse, permsResponse, entitiesResponse] = await Promise.all([
            api.get(`/v1/roles/${id}`),
            api.get('/v1/roles/permissions'),
            api.get('/v1/entities')
        ]);

        res.render('pages/settings-role-edit', {
            title: 'Edit Role & Permissions',
            user: req.user,
            role: roleResponse.data.data,
            permissions: permsResponse.data.data,
            entities: entitiesResponse.data.data,
            error: null,
            success: null
        });
    } catch (error) {
        console.error('Error fetching role for edit:', error.message);
        res.redirect(`/settings/roles?error=${encodeURIComponent('Failed to load role details.')}`);
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

// POST /settings/roles/:id/toggle-active — Toggle role active status
exports.toggleRoleActive = async (req, res) => {
    try {
        const api = getApiClient(req);
        const { id } = req.params;

        await api.patch(`/v1/roles/${id}/toggle-active`);

        res.redirect('/settings/roles?success=Role status updated successfully');
    } catch (error) {
        console.error('Error toggling role status:', error.message);
        const errorMsg = error.response?.data?.message || 'Failed to update role status.';
        res.redirect(`/settings/roles?error=${encodeURIComponent(errorMsg)}`);
    }
};
