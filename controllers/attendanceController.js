const { getApiClient } = require('../utils/apiClient');

exports.getAttendance = async (req, res, next) => {
    try {
        const apiClient = getApiClient(req);

        // Fetch paginated attendance logs
        const response = await apiClient.get('/v1/attendance');
        let attendanceLogs = [];

        if (response.data.success) {
            // Usually paginated data is in response.data.data or response.data.data.results depending on standard setup, referencing standard response format
            const dataArr = response.data.data || [];

            attendanceLogs = dataArr.map(log => ({
                id: log.id || log._id,
                employee: log.user ? log.user.fullName : 'Unknown',
                date: log.date ? new Date(log.date).toLocaleDateString() : 'N/A',
                status: 'Present', // Derived dynamically, assume present if check-in exists
                checkIn: log.checkInTime ? new Date(log.checkInTime).toLocaleTimeString() : '-',
                checkOut: log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString() : '-'
            }));
        }

        res.render('pages/attendance', { title: 'Attendance Monitoring', logs: attendanceLogs, user: req.user });
    } catch (error) {
        next(error);
    }
};
