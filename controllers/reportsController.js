exports.getReports = async (req, res) => {
    try {
        res.render('pages/reports', { title: 'Reporting Dashboard', user: req.user });
    } catch (error) {
        next(error);
    }
};
