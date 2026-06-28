const Joi = require('joi');
const adminRules = require('../config/rules/adminRules');

module.exports = {
    createProductValidator: Joi.object({
        categoryId: Joi.number().min(1).required(),
        name: Joi.string().min(adminRules.PRODUCT.NAME.MIN).max(adminRules.PRODUCT.NAME.MAX).required().messages({
            'string.min': `Name length must be at least ${adminRules.PRODUCT.NAME.MIN} characters long.`,
            'string.max': `Name length must be at most ${adminRules.PRODUCT.NAME.MAX} characters long.`,
            'string.empty': 'Name is required.',
            'any.required': 'Name is required.',
        }),
        price: Joi.number().positive().min(adminRules.PRODUCT.PRICE.MIN).max(adminRules.PRODUCT.PRICE.MAX).required().messages({
            'number.empty': 'Price USD is required.',
            'number.positive': 'Price USD must be positive.',
            'number.min': `Price USD must be at least ${adminRules.PRODUCT.PRICE.MIN}.`,
            'number.max': `Price USD must be at most ${adminRules.PRODUCT.PRICE.MAX}.`,
            'any.required': 'Price USD is required.',
        }),
        price_jod: Joi.number().positive().min(adminRules.PRODUCT.PRICE_JOD.MIN).max(adminRules.PRODUCT.PRICE_JOD.MAX).required().messages({
            'number.empty': 'Price JOD is required.',
            'number.positive': 'Price JOD must be positive.',
            'number.min': `Price JOD must be at least ${adminRules.PRODUCT.PRICE_JOD.MIN}.`,
            'number.max': `Price JOD must be at most ${adminRules.PRODUCT.PRICE_JOD.MAX}.`,
            'any.required': 'Price JOD is required.',
        }),
        minUnits: Joi.number().positive().optional().messages({
            'number.positive': 'Min units must be positive.',
        }),
        isAvailable: Joi.boolean().optional(),
        imagePath: Joi.string().min(adminRules.PRODUCT.IMAGE_PATH.MIN).max(adminRules.PRODUCT.IMAGE_PATH.MAX).empty('').optional().messages({
            'string.min': `Image path length must be at least ${adminRules.PRODUCT.IMAGE_PATH.MIN} characters long.`,
            'string.max': `Image path length must be at most ${adminRules.PRODUCT.IMAGE_PATH.MAX} characters long.`,
        }),
        dialogHasForms: Joi.boolean().optional(),
        dialogForms: Joi.string().optional().messages({
            'string.empty': 'dialogForms is required.',
        }),
        dialogDescription: Joi.string().min(adminRules.PRODUCT.DIALOG_DESCRIPTION.MIN).max(adminRules.PRODUCT.DIALOG_DESCRIPTION.MAX).empty('').optional()
        .pattern(new RegExp(adminRules.PRODUCT.DIALOG_DESCRIPTION.REGEX)).messages({
            'string.min': `dialogDescription must be at least ${adminRules.PRODUCT.DIALOG_DESCRIPTION.MIN} characters long.`,
            'string.max': `dialogDescription must be at most ${adminRules.PRODUCT.DIALOG_DESCRIPTION.MAX} characters long.`,
            'string.pattern.base': 'dialogDescription contains invalid characters.',
        }),
    }),
    updateProductValidator: Joi.object({
        productId: Joi.number().min(1).required(),
        categoryId: Joi.number().min(1).optional(),
        orderId: Joi.number().min(1).optional(),
        name: Joi.string().min(adminRules.PRODUCT.NAME.MIN).max(adminRules.PRODUCT.NAME.MAX).optional().messages({
            'string.min': `Name length must be at least ${adminRules.PRODUCT.NAME.MIN} characters long.`,
            'string.max': `Name length must be at most ${adminRules.PRODUCT.NAME.MAX} characters long.`,
        }),
        price: Joi.number().positive().min(adminRules.PRODUCT.PRICE.MIN).max(adminRules.PRODUCT.PRICE.MAX).optional().messages({
            'number.empty': 'Price USD is required.',
            'number.positive': 'Price USD must be positive.',
            'number.min': `Price USD must be at least ${adminRules.PRODUCT.PRICE.MIN}.`,
            'number.max': `Price USD must be at most ${adminRules.PRODUCT.PRICE.MAX}.`,
            'any.required': 'Price USD is required.',
        }),
        price_jod: Joi.number().positive().min(adminRules.PRODUCT.PRICE_JOD.MIN).max(adminRules.PRODUCT.PRICE_JOD.MAX).optional().messages({
            'number.empty': 'Price JOD is required.',
            'number.positive': 'Price JOD must be positive.',
            'number.min': `Price JOD must be at least ${adminRules.PRODUCT.PRICE_JOD.MIN}.`,
            'number.max': `Price JOD must be at most ${adminRules.PRODUCT.PRICE_JOD.MAX}.`,
            'any.required': 'Price JOD is required.',
        }),
        minUnits: Joi.number().positive().optional().messages({
            'number.positive': 'Min units must be positive.',
        }),
        isAvailable: Joi.boolean().optional(),
        imagePath: Joi.string().min(adminRules.PRODUCT.IMAGE_PATH.MIN).max(adminRules.PRODUCT.IMAGE_PATH.MAX).empty('').optional().messages({
            'string.min': `Image path length must be at least ${adminRules.PRODUCT.IMAGE_PATH.MIN} characters long.`,
            'string.max': `Image path length must be at most ${adminRules.PRODUCT.IMAGE_PATH.MAX} characters long.`,
        }),
        dialogHasForms: Joi.boolean().optional(),
        dialogForms: Joi.string().optional().messages({
            'string.empty': 'dialogForms is required.',
        }),
        dialogDescription: Joi.string().min(adminRules.PRODUCT.DIALOG_DESCRIPTION.MIN).max(adminRules.PRODUCT.DIALOG_DESCRIPTION.MAX).empty('').optional()
        .pattern(new RegExp(adminRules.PRODUCT.DIALOG_DESCRIPTION.REGEX)).messages({
            'string.min': `dialogDescription must be at least ${adminRules.PRODUCT.DIALOG_DESCRIPTION.MIN} characters long.`,
            'string.max': `dialogDescription must be at most ${adminRules.PRODUCT.DIALOG_DESCRIPTION.MAX} characters long.`,
            'string.pattern.base': 'dialogDescription contains invalid characters.',
        }),
    }).min(2).messages({
        'object.min': 'At least one field is required to update product.'
    }),
    updateProductOrderValidator: Joi.object({
        productId: Joi.number().min(1).required(),
        orderId: Joi.number().min(1).required()
    }),
    getProductsByCategoryValidator: Joi.object({
        categoryId: Joi.number().min(1).required()
    }),
    getProductValidator: Joi.object({
        productId: Joi.number().min(1).required()
    }),
    deleteProductValidator: Joi.object({
        productId: Joi.number().min(1).required()
    }),
    listProductsValidator: Joi.object({
        search: Joi.string().min(adminRules.PRODUCT.SEARCH.MIN).max(adminRules.PRODUCT.SEARCH.MAX).optional()
    }).messages({
        'string.empty': 'Search is required.',
        'string.min': `Search must be at least ${adminRules.PRODUCT.SEARCH.MIN} characters long.`,
        'string.max': `Search must be at most ${adminRules.PRODUCT.SEARCH.MAX} characters long.`,
        'any.required': 'Search is required.',
    })
}
