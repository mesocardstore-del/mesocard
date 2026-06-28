const crypto = require('crypto');

/**
 * Generate a secure temporary password
 * @returns {string} Randomly generated hex password
 */

function generateTempPassword() {
    return crypto.randomBytes(12).toString('hex');
}

module.exports = generateTempPassword
