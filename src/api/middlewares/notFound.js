module.exports = (req, res) => {
    const isApiRequest = req.originalUrl.startsWith('/api/') || req.get('Accept')?.includes('application/json');

    if (isApiRequest) {
        return res.status(404).json({ success: false, message: 'Route not found.' })
    }

    res.status(404).render('../../web/views/error_pages/404.ejs', {
        title: '404 Error',
        message: 'Route not found.',
        status: 404,
        env: process.env?.NODE_ENV || 'prod',
        stack: process.env?.NODE_ENV === 'dev' ? 'Route not found.' : null,
        language: req.session?.lang || req?.language || 'en'
    });
};