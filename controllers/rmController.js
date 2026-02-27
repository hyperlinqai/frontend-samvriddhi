const { getApiClient } = require('../utils/apiClient');

exports.getRMManagement = async (req, res, next) => {
    try {
        const apiClient = getApiClient(req);

        const response = await apiClient.get('/v1/users?role=RM');
        let rms = [];

        if (response.data.success) {
            // The API uses pagination so data is likely inside response.data.data
            rms = response.data.data || [];

            // Map the API fields to the view expectations or handle directly in view
            rms = rms.map(rm => ({
                id: rm.id || rm._id,
                name: rm.fullName,
                region: rm.region || 'N/A', // If the backend doesn't have region, put N/A
                status: rm.isActive ? 'Active' : 'Inactive'
            }));
        }

        res.render('pages/rm-management', { title: 'RM Management', rms, user: req.user });
    } catch (error) {
        next(error);
    }
};
