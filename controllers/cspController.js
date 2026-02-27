const { getApiClient } = require('../utils/apiClient');

exports.getCSPManagement = async (req, res, next) => {
    try {
        const apiClient = getApiClient(req);

        const response = await apiClient.get('/v1/routes/csps/all');
        let csps = [];

        if (response.data.success) {
            csps = response.data.data || [];

            csps = csps.map(csp => ({
                id: csp.id || csp._id,
                name: csp.name,
                rm: csp.rmName || 'Unassigned', // Backend might not attach RM name directly, fallback
                location: csp.address || 'Various'
            }));
        }

        res.render('pages/csp-management', { title: 'CSP Management', csps, user: req.user });
    } catch (error) {
        next(error);
    }
};
