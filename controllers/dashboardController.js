const { getApiClient } = require('../utils/apiClient');

exports.getDashboard = async (req, res, next) => {
    try {
        const apiClient = getApiClient(req);

        // Default fallback stats
        let stats = {
            totalEmployees: 0,
            presentToday: 0,
            absentToday: 0,
            pendingExpenses: 0
        };

        try {
            // Fetch data from API
            const response = await apiClient.get(`/v1/attendance/summary`);
            const statsData = response.data;

            if (statsData.success && statsData.data) {
                stats = {
                    totalEmployees: statsData.data.total || statsData.data.totalEmployees || 0,
                    presentToday: statsData.data.present || statsData.data.presentToday || 0,
                    absentToday: statsData.data.absent || statsData.data.absentToday || 0,
                    pendingExpenses: statsData.data.pendingExpenses || 0
                };
            }
        } catch (apiError) {
            console.error('Dashboard API error (using fallback stats):', apiError.message);
        }

        res.render('pages/dashboard', {
            title: 'Dashboard',
            stats,
            user: req.user
        });
    } catch (error) {
        console.error('Dashboard render error:', error.message);
        next(error);
    }
};
