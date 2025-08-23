    // Error handling middleware
    module.exports = (err, req, res, next) => {
        // Handle 404 errors
        if (res.headersSent) {
            return next(err);
        }
        
        if (err.status === 404) {
            res.status(404).json({
                message: 'Not Found'
            });
        } else {
            // Handle 500 errors
            console.error(err.stack);
            res.status(500).json({
                message: 'Internal Server Error',
                error: process.env.NODE_ENV === 'production' ? null : err.message
            });
        }
    };