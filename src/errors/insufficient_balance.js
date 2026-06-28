const CustomAPIError = require('./custom-error.js');
const { StatusCodes } = require('http-status-codes');

class InsufficientBalanceError extends CustomAPIError {
    constructor(message) {
        super(message, 'warn');
        this.statusCode = StatusCodes.PAYMENT_REQUIRED; // HTTP Payment Required
    }
  }

module.exports = InsufficientBalanceError