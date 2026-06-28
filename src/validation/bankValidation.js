const Joi = require('joi');
const bankRules = require('../config/rules/bankRules');

module.exports = {
    createBankValidator: Joi.object({
        name: Joi.string().required()
        .min(bankRules.NAME.MIN)
        .max(bankRules.NAME.MAX)
        .messages({
            'string.min': `Name must be at least ${bankRules.NAME.MIN} characters long.`,
            'string.max': `Name must be at most ${bankRules.NAME.MAX} characters long.`,
            'any.required': 'Name is required.',
            'string.empty': 'Name is required.'
        }),
        imagePath: Joi.string().optional().empty('')
        .min(bankRules.IMAGE_PATH.MIN)
        .max(bankRules.IMAGE_PATH.MAX)
        .messages({
            'string.min': `Image path must be at least ${bankRules.IMAGE_PATH.MIN} characters long.`,
            'string.max': `Image path must be at most ${bankRules.IMAGE_PATH.MAX} characters long.`,
            'string.empty': 'Image path is required.',
            'any.required': 'Image path is required.'
        }),
        isActive: Joi.boolean().optional(),
        dialogDescription: Joi.string().optional().empty('')
        .min(bankRules.DIALOG_DESCRIPTION.MIN)
        .max(bankRules.DIALOG_DESCRIPTION.MAX)
        .pattern(bankRules.DIALOG_DESCRIPTION.REGEX)
        .messages({
            'string.min': `Dialog Description must be at least ${bankRules.DIALOG_DESCRIPTION.MIN} characters long.`,
            'string.max': `Dialog Description must be at most ${bankRules.DIALOG_DESCRIPTION.MAX} characters long.`,
            'string.empty': 'Dialog Description is required.',
            'any.required': 'Dialog Description is required.',
            'string.pattern': 'Dialog Description is invalid.'
        }),
        dialogHasForms: Joi.boolean().optional(),
        dialogForms: Joi.string().optional().empty('')
        .messages({
            'string.empty': 'Dialog Forms is required.',
            'any.required': 'Dialog Forms is required.'
        })
    }),
    updateBankValidator: Joi.object({
        name: Joi.string().optional().empty('')
        .min(bankRules.NAME.MIN)
        .max(bankRules.NAME.MAX)
        .messages({
            'string.min': `Name must be at least ${bankRules.NAME.MIN} characters long.`,
            'string.max': `Name must be at most ${bankRules.NAME.MAX} characters long.`,
            'any.required': 'Name is required.',
            'string.empty': 'Name is required.'
        }),
        dialogDescription: Joi.string().optional().empty('')
        .min(bankRules.DIALOG_DESCRIPTION.MIN)
        .max(bankRules.DIALOG_DESCRIPTION.MAX)
        .pattern(bankRules.DIALOG_DESCRIPTION.REGEX)
        .messages({
            'string.min': `Dialog Description must be at least ${bankRules.DIALOG_DESCRIPTION.MIN} characters long.`,
            'string.max': `Dialog Description must be at most ${bankRules.DIALOG_DESCRIPTION.MAX} characters long.`,
            'string.empty': 'Dialog Description is required.',
            'any.required': 'Dialog Description is required.',
            'string.pattern': 'Dialog Description is invalid.'
        }),
        isActive: Joi.boolean().optional(),
        imagePath: Joi.string().optional().empty('')
        .min(bankRules.IMAGE_PATH.MIN)
        .max(bankRules.IMAGE_PATH.MAX)
        .messages({
            'string.min': `Image path must be at least ${bankRules.IMAGE_PATH.MIN} characters long.`,
            'string.max': `Image path must be at most ${bankRules.IMAGE_PATH.MAX} characters long.`,
            'string.empty': 'Image path is required.',
            'any.required': 'Image path is required.'
        }),
        dialogHasForms: Joi.boolean().optional(),
        dialogForms: Joi.string().optional().empty('')
        .messages({
            'string.empty': 'Dialog Forms is required.',
            'any.required': 'Dialog Forms is required.',
        })
    }).min(1).messages({
        'object.min': 'At least one field is required to update bank.'
    }),
    
}