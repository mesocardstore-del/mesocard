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
        confirmPassword: Joi.string().required().valid(Joi.ref('password')).messages({
            'any.only': 'Passwords must match.'
        }),
        phoneNumber: Joi.string().min(userRules.PHONE.min).max(userRules.PHONE.max).required()
        .pattern(new RegExp(userRules.PHONE.regex)).message({
            'string.min': `Phone number must be at least ${userRules.PHONE.min} characters long.`,
            'string.max': `Phone number must be at most ${userRules.PHONE.max} characters long.`,
            'string.pattern.base': 'Phone number contains invalid characters.',
            'string.empty': 'Phone number is required.',
            'any.required': 'Phone number is required.'
        }),
        email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: userRules.EMAIL.allowedTLDS } }).required().messages({
            'string.email': 'Email must be a valid email address.',
            'string.empty': 'Email is required.',
            'any.required': 'Email is required.'
        }),
    }),
    updateUserProfileValidator: Joi.object({
        firstName: Joi.string()
        .min(userRules.FIRSTNAME.min).max(userRules.FIRSTNAME.max).required()
        .pattern(new RegExp(userRules.FIRSTNAME.regex)).messages({
            'string.min': `الأسم الأول يجب أن يحتوي على الأقل ${userRules.FIRSTNAME.min} حرف.`,
            'string.max': `الأسم الأول يجب أن يحتوي على الأكثر ${userRules.FIRSTNAME.max} حرف.`,
            'string.pattern.base': 'الأسم الأول يحتوي على حروف غير صالحة.',
            'string.empty': 'الأسم الأول مطلوب.',
            'any.required': 'الأسم الأول مطلوب.'
        }),
        lastName: Joi.string()
        .min(userRules.LASTNAME.min).max(userRules.LASTNAME.max).required()
        .pattern(new RegExp(userRules.LASTNAME.regex)).messages({
            'string.min': `الأسم الأخير يجب أن يحتوي على الأقل ${userRules.LASTNAME.min} حرف.`,
            'string.max': `الأسم الأخير يجب أن يحتوي على الأكثر ${userRules.LASTNAME.max} حرف.`,
            'string.pattern.base': 'الأسم الأخير يحتوي على حروف غير صالحة.',
            'string.empty': 'الأسم الأخير مطلوب.',
            'any.required': 'الأسم الأخير مطلوب.'
        }),
        email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: userRules.EMAIL.allowedTLDS } }).required().messages({
            'string.email': 'البريد الإلكتروني يجب أن يكون صحيحًا.',
            'string.empty': 'البريد الإلكتروني مطلوب.',
            'any.required': 'البريد الإلكتروني مطلوب.'
        }),
        profileImage: Joi.string().optional().allow(null).allow(''),
    }),
    addToCartValidator: Joi.object({
        productId: Joi.number().required(),
        quantity: Joi.number().required(),
        submittedFields: Joi.string().optional().allow(null).allow(''),
    })
}
