const Joi = require('joi');
const userRules = require('../config/rules/userRules');

module.exports = {
    createUserValidator: Joi.object({
        firstName: Joi.string()
        .min(userRules.FIRSTNAME.min).max(userRules.FIRSTNAME.max).required()
        .pattern(new RegExp(userRules.FIRSTNAME.regex)).messages({
            'string.min': `Firstname must be at least ${userRules.FIRSTNAME.min} characters long.`,
            'string.max': `Firstname must be at most ${userRules.FIRSTNAME.max} characters long.`,
            'string.pattern.base': 'Firstname contains invalid characters.',
            'string.empty': 'Firstname is required.',
            'any.required': 'Firstname is required.'
        }),
        lastName: Joi.string()
        .min(userRules.LASTNAME.min).max(userRules.LASTNAME.max).required()
        .pattern(new RegExp(userRules.LASTNAME.regex)).messages({
            'string.min': `Lastname must be at least ${userRules.LASTNAME.min} characters long.`,
            'string.max': `Lastname must be at most ${userRules.LASTNAME.max} characters long.`,
            'string.pattern.base': 'Lastname contains invalid characters.',
            'string.empty': 'Lastname is required.',
            'any.required': 'Lastname is required.'
        }),
        password: Joi.string().min(userRules.PASSWORD.min).max(userRules.PASSWORD.max).required()
        .pattern(new RegExp(userRules.PASSWORD.regex)).message({
            'string.min': `Password must be at least ${userRules.PASSWORD.min} characters long.`,
            'string.max': `Password must be at most ${userRules.PASSWORD.max} characters long.`,
            'string.pattern.base': 'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.',
            'string.empty': 'Password is required.',
            'any.required': 'Password is required.'
        }),
        email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: userRules.EMAIL.allowedTLDS } }).required().messages({
            'string.email': 'Email must be a valid email address.',
            'string.empty': 'Email is required.',
            'any.required': 'Email is required.'
        }),
        phoneNumber: Joi.string().min(userRules.PHONE.min).max(userRules.PHONE.max).messages({
            'string.min': `Phone number must be at least ${userRules.PHONE.min} characters long.`,
            'string.max': `Phone number must be at most ${userRules.PHONE.max} characters long.`,
            'string.empty': 'Phone number is required.',
            'any.required': 'Phone number is required.'
        }),
        status: Joi.string().required().valid('active', 'pending', 'locked').messages({
            'any.only': 'Invalid status.'
        }),
        badge: Joi.string().optional().messages({
            'any.string': 'Badge must be a string.'
        }),
        role: Joi.string().required().valid('user', 'admin').messages({
            'any.only': 'Invalid role.'
        })
    }),
    updateUserProfileValidator: Joi.object({
        firstName: Joi.string()
        .min(userRules.FIRSTNAME.min).max(userRules.FIRSTNAME.max).required()
        .pattern(new RegExp(userRules.FIRSTNAME.regex)).messages({
            'string.min': `Firstname must be at least ${userRules.FIRSTNAME.min} characters long.`,
            'string.max': `Firstname must be at most ${userRules.FIRSTNAME.max} characters long.`,
            'string.pattern.base': 'Firstname contains invalid characters.',
            'string.empty': 'Firstname is required.',
            'any.required': 'Firstname is required.'
        }),
        lastName: Joi.string()
        .min(userRules.LASTNAME.min).max(userRules.LASTNAME.max).required()
        .pattern(new RegExp(userRules.LASTNAME.regex)).messages({
            'string.min': `Lastname must be at least ${userRules.LASTNAME.min} characters long.`,
            'string.max': `Lastname must be at most ${userRules.LASTNAME.max} characters long.`,
            'string.pattern.base': 'Lastname contains invalid characters.',
            'string.empty': 'Lastname is required.',
            'any.required': 'Lastname is required.'
        }),
        email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: userRules.EMAIL.allowedTLDS } }).required().messages({
            'string.email': 'Email must be a valid email address.',
            'string.empty': 'Email is required.',
            'any.required': 'Email is required.'
        })
    }),
    updateUserPasswordValidator: Joi.object({
        password: Joi.string().min(userRules.PASSWORD.min).max(userRules.PASSWORD.max).required()
        .pattern(new RegExp(userRules.PASSWORD.regex)).message({
            'string.min': `Password must be at least ${userRules.PASSWORD.min} characters long.`,
            'string.max': `Password must be at most ${userRules.PASSWORD.max} characters long.`,
            'string.pattern.base': 'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.',
            'string.empty': 'Password is required.',
            'any.required': 'Password is required.'
        })
    }),
    updateUserRoleValidator: Joi.object({
        role: Joi.string().required().valid('user', 'admin').messages({
            'any.only': 'Invalid role.'
        })
    }),
    updateUserStatusValidator: Joi.object({
        status: Joi.string().required().valid('active', 'pending', 'locked').messages({
            'any.only': 'Invalid status.'
        })
    }),
    updateUserBalanceValidator: Joi.object({
        balance: Joi.number().required().messages({
            'number.empty': 'Balance is required.',
            'any.required': 'Balance is required.'
        })
    })
}