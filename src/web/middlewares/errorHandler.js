require('dotenv').config();
const { StatusCodes } = require('http-status-codes');
const { CustomAPIError } = require('../../errors');

const errorHandlerMiddleware = (err, req, res, next) => {
    let customError = {};
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

    return res.status(customError.statusCode).json({
        message: customError.msg,
        stack: customError?.stack,
        results: null,
        success: false
    });
}

module.exports = errorHandlerMiddleware;