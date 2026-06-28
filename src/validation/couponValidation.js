const Joi = require('joi');

module.exports = {
    createCoupon: Joi.object({
        code: Joi.string().required(),
        discountPercent: Joi.number().required(),
        usageLimit: Joi.number().required(),
        allowedProducts: Joi.array().required(),
        expirationDate: Joi.date().required()
    }),
    updateCoupon: Joi.object({
        code: Joi.string().optional(),
        discountPercent: Joi.number().optional(),
        usageLimit: Joi.number().optional(),
        allowedProducts: Joi.array().optional(),
        expirationDate: Joi.date().optional()
    }).min(1).messages({
        'object.min': 'At least one field is required to update coupon.'
    }),
    bulkDelete: Joi.object({
        ids: Joi.array().required().min(1).messages({
            'array.min': 'At least one ID is required to delete coupons.'
        })
    })
}
