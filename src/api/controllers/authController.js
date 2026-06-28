const { debug } = require('../../utils/debug');
const userAuthService = require('../../services/UserAuthService');
const emailService = require('../../services/EmailService')
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const logger = require('../../utils/logger');
const { 
    createUserValidator
} = require('../../validation/userValidation');

const {
    BadRequestError,
    UnauthenticatedError,
    ForbiddenError,
    TooManyRequestsError,
    InternalServerError,
    ConflictError
} = require('../../errors');


const userRegister = async (req, res) => {
    const clientIp = req.clientIp || 'unknown';
    const { error } = createUserValidator.validate({ ...req.body });
    if (error) throw new BadRequestError(error.details[0].message);
    
    const user = await userAuthService.userRegister(req.body, clientIp);
    const token = await user.createJWT(clientIp);

    if (!user) {
        throw new InternalServerError('Failed to register user.');
    }

    if (req.session) {
        req.session.user = {
            userId: user.id,
            role: user.role,
            isNewUser: user.isNewUser,
            token
        };
    }
    
    // Set HTTP-only cookie for security
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'prod',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Set a non-HTTP-only cookie for frontend access
    res.cookie('hasToken', 'true', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'prod',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    res.status(StatusCodes.OK).json({
        message: 'User registered successfully, you can now login.',
        results: { email: user.email, token },
        success: true
    });
}

const userLogin = async (req, res) => {
    const warnings = [];
    const clientIp = req?.clientIp || 'unknown';
    const { email, password } = req?.body;
    if (!email || !password) {
        throw new BadRequestError('Both email and password must be provided');
    }

    const user = await userAuthService.userLogin({ email, password }, clientIp);
    
    if (!user) {
        throw new UnauthenticatedError('Invalid email or password.');
    }
    if (user.status === 'locked') {
        throw new ForbiddenError('Account locked, Contact support.');
    }

    const token = await user.createJWT(clientIp);


    if (req?.session) {
        req.session.user = {
            userId: user?.id,
            role: user?.role,
            isNewUser: user?.isNewUser,
            token
        };
    }
    
    debug(`[userLogin] isNewUser: ${user.isNewUser}`);

    // Set HTTP-only cookie for security
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'prod',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Set a non-HTTP-only cookie for frontend access
    res.cookie('hasToken', 'true', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'prod',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    res.status(StatusCodes.OK).json({
        message: 'Login successful',
        results: { email: user.email, token },
        success: true,
        warnings
    });
}

const forgotPassword = async (req, res) => {
    const { email } = req?.body;
    if (!email) throw new BadRequestError('Email is required.');
    
    await userAuthService.forgotPassword(email);

    res.status(StatusCodes.OK).json({
        message: 'Reset link will be sent if email exists.',
        success: true
    });
}

const resetPassword = async (req, res) => {
    const { token, password, confirmPassword } = req?.body;
    if (!token || !password || !confirmPassword) throw new BadRequestError('A valid token and password must be provided.');
    if (password !== confirmPassword) throw new BadRequestError('Passwords do not match.');
    
    const user = await userAuthService.resetPassword(token, password);
    if (!user) throw new UnauthenticatedError('Invalid token.');
    
    res.status(StatusCodes.OK).json({
        message: 'Password reset successfully',
        success: true
    });
}


const validateToken = async (req, res) => {
    const { token } = req.body;
    if (!token) {
        throw new BadRequestError('A valid token must be provided.');
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.status(StatusCodes.OK).json({
            message: 'Token is valid',
            results: decoded,
            success: true
        });
    } catch (error) {
        throw new UnauthenticatedError('Invalid authentication credentials provided.');
    }
}

// Existing token validation functions
const validateGoogleToken = async (accessToken, email) => {
    try {
        const response = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`);
        
        // Additional validation
        if (response.data?.email !== email) {
            throw new Error('Email mismatch');
        }
        
        return {
            email: response.data?.email,
            verified: response.data?.email_verified === 'true'
        };
    } catch (error) {
        logger.error('Google Token Validation Error', { 
            errorMessage: error.message,
            email 
        });
        throw error;
    }
};

const validateFacebookToken = async (accessToken, facebookId) => {
    try {
        const response = await axios.get(`https://graph.facebook.com/me?fields=id,email&access_token=${accessToken}`);
        
        // Additional validation
        if (response.data?.id !== facebookId) {
            throw new Error('Facebook ID mismatch');
        }
        
        return {
            email: response.data?.email,
            verified: !!response.data?.email
        };
    } catch (error) {
        logger.error('Facebook Token Validation Error', { 
            errorMessage: error.message,
            facebookId 
        });
        throw error;
    }
};

module.exports = {
    userRegister,
    userLogin,
    forgotPassword,
    resetPassword,
    validateToken,
    validateGoogleToken,
    validateFacebookToken
};