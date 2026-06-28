const Joi = require('joi');
const adminRules = require('../config/rules/adminRules');

module.exports = { 
    createCategoryValidator: Joi.object({
        name: Joi.string().required()
        .min(adminRules.CATEGORY.NAME.MIN)
        .max(adminRules.CATEGORY.NAME.MAX)
        .messages({
            'string.min': `Name must be at least ${adminRules.CATEGORY.NAME.MIN} characters long.`,
            'string.max': `Name must be at most ${adminRules.CATEGORY.NAME.MAX} characters long.`,
            'any.required': 'Name is required.',
            'string.empty': 'Name is required.'
        }),
        nameAr: Joi.string().required()
        .min(adminRules.CATEGORY.NAME_AR.MIN)
        .max(adminRules.CATEGORY.NAME_AR.MAX)
        .messages({
            'string.min': `NameAr must be at least ${adminRules.CATEGORY.NAME_AR.MIN} characters long.`,
            'string.max': `NameAr must be at most ${adminRules.CATEGORY.NAME_AR.MAX} characters long.`,
            'any.required': 'NameAr is required.',
            'string.empty': 'NameAr is required.'
        }),
        description: Joi.string().optional()
        .min(adminRules.CATEGORY.DESCRIPTION.MIN)
        .max(adminRules.CATEGORY.DESCRIPTION.MAX)
        .messages({
            'string.min': `Description must be at least ${adminRules.CATEGORY.DESCRIPTION.MIN} characters long.`,
            'string.max': `Description must be at most ${adminRules.CATEGORY.DESCRIPTION.MAX} characters long.`,
            'string.empty': 'Description is required.',
            'any.required': 'Description is required.'
        }),
        categoryImage: Joi.string().optional(),
        isActive: Joi.boolean().optional(),
        parentId: Joi.number().optional(),
    }),
    // at least one string field is required
    updateCategoryValidator: Joi.object({
        name: Joi.string().optional()
        .min(adminRules.CATEGORY.NAME.MIN)
        .max(adminRules.CATEGORY.NAME.MAX)
        .messages({
            'string.min': `Name must be at least ${adminRules.CATEGORY.NAME.MIN} characters long.`,
            'string.max': `Name must be at most ${adminRules.CATEGORY.NAME.MAX} characters long.`,
            'any.required': 'Name is required.',
            'string.empty': 'Name is required.'
        }),
        nameAr: Joi.string().optional()
        .min(adminRules.CATEGORY.NAME_AR.MIN)
        .max(adminRules.CATEGORY.NAME_AR.MAX)
        .messages({
            'string.min': `NameAr must be at least ${adminRules.CATEGORY.NAME_AR.MIN} characters long.`,
            'string.max': `NameAr must be at most ${adminRules.CATEGORY.NAME_AR.MAX} characters long.`,
            'any.required': 'NameAr is required.',
            'string.empty': 'NameAr is required.'
        }),
        description: Joi.string().optional()
        .min(adminRules.CATEGORY.DESCRIPTION.MIN)
        .max(adminRules.CATEGORY.DESCRIPTION.MAX)
        .messages({
            'string.min': `Description must be at least ${adminRules.CATEGORY.DESCRIPTION.MIN} characters long.`,
            'string.max': `Description must be at most ${adminRules.CATEGORY.DESCRIPTION.MAX} characters long.`,
            'string.empty': 'Description is required.',
            'any.required': 'Description is required.'
        }),
        categoryImage: Joi.string().optional(),
        isActive: Joi.boolean().optional(),
        parentId: Joi.number().optional(),
    }).min(1).messages({
        'object.min': 'At least one field is required to update category.',
    }),
    updateCategoryOrderValidator: Joi.object({
        categoryId: Joi.number().min(1).required(),
        orderId: Joi.number().min(1).required()
    })
}