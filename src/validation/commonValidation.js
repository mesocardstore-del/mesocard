const Joi = require('joi');

module.exports = {
    uuidv4Validator: Joi.object({
        id: Joi.string().uuid({ version: 'uuidv4' }).required().messages({
            'string.empty': 'ID is required.',
            'string.uuid': 'Invalid ID.',
            'string.guid': 'Invalid ID.',
            'any.required': 'ID is required.'
        })
    }),
    paginationValidator: Joi.object({
        page: Joi.number().integer().min(1).max(99000000).default(1).positive(),
        limit: Joi.number().integer().min(1).max(500).default(20).positive()
    }),
    searchValidator: Joi.object({
        search: Joi.string().optional().default('').empty('').messages({
            'string.base': 'Search must be a string.'
        })
    }),
    roleValidator: Joi.object({
        role: Joi.string().optional().valid('user', 'admin').default('').empty('').messages({
            'string.base': 'Role must be a string.',
            'any.only': 'Invalid role.'
        })
    }),
    statusValidator: Joi.object({
        status: Joi.string().optional().valid('pending', 'active', 'locked').default('').empty('').messages({
            'string.base': 'Status must be a string.',
            'any.only': 'Invalid status.'
        })
    })
}
