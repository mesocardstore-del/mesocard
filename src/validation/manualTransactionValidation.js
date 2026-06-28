const Joi = require('joi');

module.exports = {
    updateManualTransactionValidator: Joi.object({
        status: Joi.string().required().valid('pending', 'accepted', 'rejected').messages({
            'string.empty': 'Status is required.',
            'string.required': 'Status is required.',
            'string.valid': 'Status must be either "pending", "accepted", or "rejected".',
        }),
        message: Joi.string().optional().default('').empty('').messages({
            'string.base': 'Message must be a string.',
            'string.empty': 'Message is required.',
            'string.required': 'Message is required.'
        })
    })
}
