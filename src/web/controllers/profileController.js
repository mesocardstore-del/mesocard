const i18next = require('../../config/i18next');
const { StatusCodes } = require('http-status-codes');
const { UnauthenticatedError } = require('../../errors');
const User = require('../../models/User');

const completeUserProfile = async (req, res) => {
    if (!req.session?.user) return res.redirect('/login');
    if (!req.session.user?.isNewUser) return res.redirect('/app/user');

    const language = req.session?.lang || req.language || 'en';
    
    const t = (key) => i18next.t(key, { lng: language });
    
    res.status(StatusCodes.OK).render('portals/visitors/auth/complete-registration', {
        language,
        description: t('completeRegisteration.form.description'),
        country: {
            label: t('completeRegisteration.form.country.label'),
            placeholder: t('completeRegisteration.form.country.placeholder'),
            patternMessage: t('completeRegisteration.form.country.patternMessage'),
        },
        phone: {
            label: t('completeRegisteration.form.phone.label'),
            placeholder: t('completeRegisteration.form.phone.placeholder'),
            patternMessage: t('completeRegisteration.form.phone.patternMessage'),
        },
        completeButton: t('completeRegisteration.form.completeButton'),
        // For JS
        selectCountry: t('completeRegisteration.form.selectCountry'),
        enterPhoneNumber: t('completeRegisteration.form.enterPhoneNumber'),
        redirectMessage: t('completeRegisteration.form.redirectMessage'),
        errorOccured: t('completeRegisteration.form.errorOccured'),
        networkError: t('completeRegisteration.form.networkError'),
        session: {
            lang: language
        }
    });
};

const updateUserNumber = async (req, res) => {
    const clientIp = req.clientIp || 'unknown';
    if (!req.session?.user?.userId || !req.session.user?.isNewUser) return res.redirect('/');
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Phone number is required' });
    }

    const user = await User.findByPk(req.session.user?.userId);
    await user.update({ phoneNumber, isNewUser: false, status: 'active' });
    const token = await user.createJWT(clientIp);
    
    if (req.session) {
        req.session.user = {
            userId: req.session.user?.userId,
            role: req.session.user?.role,
            isNewUser: false,
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
    
    return res.redirect('/login');
};

const getUserProfile = async (req, res) => {
    if (!req.session?.user) throw new UnauthenticatedError('User is not authenticated');
    const user = await User.findByPk(req.session?.user?.userId);
    if (!user) throw new UnauthenticatedError('User not found');

    const { email, firstName, lastName, profileImage, role, balance, badge } = user;
    return res.status(StatusCodes.OK).json({
        success: true,
        message: 'User profile retrieved successfully',
        results: [{ email, firstName, lastName, profileImage, role, balance, badge }]
    });
};



module.exports = {
    completeUserProfile,
    updateUserNumber,
    getUserProfile
};
