const { debug } = require('../../utils/debug');
const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const path = require('path');
const { 
    UnauthenticatedError
} = require('../../errors');

// For API
const authentication = async (req, res, next) => {
    const cookie = req.cookies?.jwt;
    const authHeader = req.headers?.authorization;
    let token;
    if (!authHeader || !authHeader.startsWith('Bearer')){
        if (!cookie){
            throw new UnauthenticatedError('Invalid authentication');
        }
        token = cookie;
    } else {
        token = authHeader.split(' ')[1];
    }

    try{
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            userId: payload.userId,
            role: payload.role
        };
        
        req.session.user = {
            userId: payload.userId,
            role: payload.role,
            isNewUser: payload.isNewUser,
            token
        };

        next();
    } catch(error){
        throw new UnauthenticatedError('Invalid authentication credentials provided.');
    }
}

const authenticationRole = (role) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        let token;
        if (!authHeader || !authHeader.startsWith('Bearer')){
            if (!req.cookies?.jwt){
                throw new UnauthenticatedError('Invalid authentication');
            }
            token = req.cookies.jwt;
        } else {
            token = authHeader.split(' ')[1];
        }

        try{
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            req.user = {
                userId: payload.userId,
                role: payload.role,
                isNewUser: payload.isNewUser
            };

            req.session.user = {
                userId: payload.userId,
                role: payload.role,
                isNewUser: payload.isNewUser
            };
            if (req.user?.role !== role) {
                throw new UnauthenticatedError('Invalid authentication credentials provided.');
            }
            next();
        } catch(error){
            throw new UnauthenticatedError('Invalid authentication credentials provided.');
        }
    }
}


// For EJS
const checkSession = (req, res, next) => {
    if (req.session?.user) {
        return next();
    }
    return res.redirect('/login');
};

const checkSessionRole = (role) => {
    return (req, res, next) => {
        if (req.session?.user && req.session?.user?.role === role) {
            return next();
        }
        return res.redirect('/login');
    };
};

const logout = async (req, res, next) => {
    try {
        // Clear session if it exists
        if (req.session) {
            await new Promise((resolve, reject) => {
                req.session.destroy(err => {
                    if (err) {
                        debug('[logout] Failed to destroy session:', err);
                        return reject(err);
                    }
                    debug('[logout] Session destroyed');
                    resolve();
                });
            });
        }

        // Clear all authentication cookies
        const cookies = ['connect.sid', 'jwt', 'hasToken'];
        cookies.forEach(cookie => res.clearCookie(cookie));
        debug('[logout] Cookies cleared');

        // Redirect to login page
        return res.redirect('/login');
        
    } catch (error) {
        debug('[logout] Error during logout:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).sendFile(
            path.join(__dirname, '..', '..', 'client', 'error_pages', '500.html')
        );
    }
};
module.exports = {
    authentication,
    authenticationRole,
    checkSession,
    checkSessionRole,
    logout
};
