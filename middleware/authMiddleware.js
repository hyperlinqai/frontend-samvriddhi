const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here', (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.redirect('/login');
            } else {
                // Pass user to views
                req.user = decodedToken;
                res.locals.user = decodedToken;
                next();
            }
        });
    } else {
        res.redirect('/login');
    }
};

const requireRole = (roles) => {
    return (req, res, next) => {
        if (req.user && roles.includes(req.user.role)) {
            next();
        } else {
            const error = new Error('Forbidden: You do not have permission to access this resource.');
            error.status = 403;
            next(error);
        }
    };
};

module.exports = { requireAuth, requireRole };
