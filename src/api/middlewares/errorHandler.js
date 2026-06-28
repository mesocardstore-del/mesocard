require('dotenv').config();
const { StatusCodes } = require('http-status-codes');
const { CustomAPIError } = require('../../errors');
const logger = require('../../utils/logger');

// Helper function to map status codes to error pages
function getErrorPage(statusCode) {
    const errorPages = {
        400: '400',
        401: '401',
        403: '403',
        404: '404',
        409: '409',
        422: '422',
        429: '429',
        500: '500'
    };
    return errorPages[statusCode] || '500';
}

const errorHandlerMiddleware = (err, req, res, next) => {
    let customError = {};
    const clientIP = req.clientIp || 'unknown';
    const userId = req?.user?.userId || 'guest';

    if (err instanceof CustomAPIError) {
        customError = {
            statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
            msg: err.message || 'Something went wrong, please try again later'
        }
    } else {
        customError = {
            statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
            msg: 'Something went wrong, please try again later'
        }
    }

    if (process.env?.NODE_ENV === 'dev') {
        if (err.message) {
            customError.msg = err.message;
            customError.stack = err.stack;
        }
    }

    // Check if the request is an API request
    const isApiRequest = req.originalUrl.startsWith('/api/') || req.get('Accept')?.includes('application/json');

    // Log with logger
    logger.error({
        message: `${customError?.msg}`,
        stack: customError?.stack,
        clientIP,
        userId
    });

    if (isApiRequest) {
        return res.status(customError.statusCode).json({
            message: customError.msg,
            stack: customError?.stack,
            results: null,
            success: false
        });
    }

    const errorPage = getErrorPage(customError.statusCode);
    return res.status(customError.statusCode).render(`../../web/views/error_pages/${errorPage}.ejs`, {
        title: `${customError.statusCode} Error`,
        message: customError.msg,
        status: customError.statusCode,
        env: process.env?.NODE_ENV || 'prod',
        stack: process.env?.NODE_ENV === 'dev' ? customError?.stack : null,
        language: req.session?.lang || req?.language || 'en'
    });

}

module.exports = errorHandlerMiddleware;