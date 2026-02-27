const { apiClient, getApiClient } = require('../utils/apiClient');
const jwt = require('jsonwebtoken');

exports.getLogin = (req, res) => {
    // If already logged in, redirect to dashboard
    if (req.cookies.jwt) {
        return res.redirect('/dashboard');
    }
    res.render('pages/login', { layout: 'layouts/auth', error: null });
};

exports.postLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Authenticate via external API
        const response = await apiClient.post(`/v1/auth/login`, { email, password });

        // Extract backend token and user data
        const backendData = response.data;
        console.log('Backend login response keys:', Object.keys(backendData));

        // Handle multiple possible API response structures
        let token = null;
        let userData = null;

        // Structure: { data: { tokens: { accessToken: "..." }, user: {...} } }
        if (backendData.data && backendData.data.tokens && backendData.data.tokens.accessToken) {
            token = backendData.data.tokens.accessToken;
        }
        // Structure: { data: { token: "..." } }
        else if (backendData.data && backendData.data.token) {
            token = backendData.data.token;
        }
        // Structure: { token: "..." }
        else if (backendData.token) {
            token = backendData.token;
        }

        // Extract user data
        if (backendData.data && backendData.data.user) {
            userData = backendData.data.user;
        } else if (backendData.user) {
            userData = backendData.user;
        }

        console.log('Extracted token exists:', !!token);
        console.log('Extracted user:', userData ? userData.fullName : 'null');

        if (!backendData.success || !token) {
            throw new Error('Authentication failed - could not extract token');
        }

        // Create a session token for the frontend
        const sessionPayload = {
            id: userData.id,
            name: userData.fullName,
            role: userData.role,
            email: userData.email,
            phone: userData.phone
        };

        // Generate JWT token for frontend session cookies
        const frontendToken = jwt.sign(sessionPayload, process.env.JWT_SECRET || 'your_jwt_secret_key_here', { expiresIn: '1d' });

        // Store frontend JWT for view/UI state
        res.cookie('jwt', frontendToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        // Store backend JWT for API passthrough
        res.cookie('jwt_backend', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

        console.log('Login successful, redirecting to dashboard');
        res.redirect('/dashboard');

    } catch (error) {
        console.error('Login error:', error.message);
        res.render('pages/login', {
            layout: 'layouts/auth',
            error: error.response?.data?.message || error.message || 'Invalid email or password.'
        });
    }
};

exports.getLogout = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.cookie('jwt_backend', '', { maxAge: 1 });
    res.redirect('/login');
};

// Forgot Password
exports.getForgotPassword = (req, res) => {
    if (req.cookies.jwt) {
        return res.redirect('/dashboard');
    }
    res.render('pages/forgot-password', { layout: 'layouts/auth', error: null, success: null });
};

exports.postForgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        // Note: The backend may or may not have a forgot-password endpoint.
        // If it does, call it here. Otherwise, show a generic success message.
        // await apiClient.post('/v1/auth/forgot-password', { email });

        // For now, show a success message regardless (prevents email enumeration)
        res.render('pages/forgot-password', {
            layout: 'layouts/auth',
            error: null,
            success: 'If an account with that email exists, a password reset link has been sent.'
        });
    } catch (error) {
        res.render('pages/forgot-password', {
            layout: 'layouts/auth',
            error: error.response?.data?.message || 'Something went wrong. Please try again.',
            success: null
        });
    }
};

// Change Password
exports.getChangePassword = (req, res) => {
    res.render('pages/change-password', {
        title: 'Change Password',
        user: req.user,
        success: req.query.success || null,
        error: req.query.error || null
    });
};

exports.postChangePassword = async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
        return res.redirect('/change-password?error=' + encodeURIComponent('Passwords do not match.'));
    }

    try {
        const api = getApiClient(req);
        await api.post('/v1/auth/change-password', {
            currentPassword,
            newPassword
        });

        res.redirect('/change-password?success=' + encodeURIComponent('Password changed successfully!'));
    } catch (error) {
        console.error('Change password error:', error.message);
        const errorMsg = error.response?.data?.message || 'Failed to change password.';
        res.redirect('/change-password?error=' + encodeURIComponent(errorMsg));
    }
};

// Profile
exports.getProfile = async (req, res) => {
    try {
        const api = getApiClient(req);
        const response = await api.get('/v1/auth/profile');

        let profileData = {};
        if (response.data.success) {
            profileData = response.data.data || response.data.user || {};
        }

        res.render('pages/profile', {
            title: 'Profile',
            user: req.user,
            profileData,
            success: req.query.success || null
        });
    } catch (error) {
        console.error('Profile error:', error.message);
        // Fallback to session data if API fails
        res.render('pages/profile', {
            title: 'Profile',
            user: req.user,
            profileData: {
                id: req.user.id,
                fullName: req.user.name,
                email: req.user.email,
                phone: req.user.phone,
                role: req.user.role,
                isActive: true
            },
            success: null
        });
    }
};

// Notifications
exports.getNotifications = (req, res) => {
    // Placeholder: The API doesn't have a notifications endpoint yet.
    // When available, fetch from API. For now, show empty state.
    const notifications = [];

    res.render('pages/notifications', {
        title: 'Notifications',
        user: req.user,
        notifications
    });
};
