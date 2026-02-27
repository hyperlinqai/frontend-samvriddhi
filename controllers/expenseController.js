const { getApiClient } = require('../utils/apiClient');

exports.getExpenses = async (req, res, next) => {
    try {
        const apiClient = getApiClient(req);

        const response = await apiClient.get('/v1/expenses');
        let expenses = [];

        if (response.data.success) {
            const dataArr = response.data.data || [];

            expenses = dataArr.map(exp => ({
                id: exp.id || exp._id,
                employee: exp.user ? exp.user.fullName : 'Unknown',
                amount: exp.amount || 0,
                purpose: exp.description || exp.category || 'N/A',
                status: exp.status || 'PENDING'
            }));
        }

        res.render('pages/expense', { title: 'Expense Approval', expenses, user: req.user });
    } catch (error) {
        next(error);
    }
};
