const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../../../models/User');
const generateTempPassword = require('../../../utils/generateTempPassword');
const { downloadProfilePicture } = require('../../../utils/profileUtils');


const BASE_URL = process.env.NODE_ENV === 'prod' 
    ? process.env.BASE_URL 
    : process.env.BASE_URL_DEV;

const passportGoogleLogin = async (req, res, next) => {
    const tempPassword = generateTempPassword();
    // Configure Google OAuth Strategy
    passport.use(new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${BASE_URL}/auth/google/callback`,
            passReqToCallback: true,
            scope: ['profile', 'email']
        },
        async (req, accessToken, refreshToken, profile, done) => {
            try {
                // Find or create user
                const userParams = {
                    googleId: profile.id,
                    email: profile.emails[0].value,
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    profileImage: '/static/images/avatar/default-avatar.png',
                    isOAuthUser: true,
                    password: tempPassword,
                    phoneNumber: '0000000000',
                    lastLoginIP: req.clientIp || 'unknown',
                    isNewUser: true
                };

                const [user, created] = await User.findOrCreate({
                    where: { 
                        email: userParams.email
                    },
                    defaults: userParams
                });

                user.isNewUser = created;
                if (user.isNewUser) {
                    const profilePicUrl = profile.photos[0].value;
                    const savedProfilePicPath = await downloadProfilePicture(profilePicUrl, process.env.UPLOAD_DIR, user.id);
                    // Update user with profile picture path
                    if (savedProfilePicPath) {
                        await User.update({ 
                            profileImage: savedProfilePicPath
                        }, {
                            where: {
                                id: user.id
                            }
                        });
                    }
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    ));

    // Passport serialization methods
    passport.serializeUser(async (user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findByPk(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });

    // Authenticate with Google
    passport.authenticate('google', { 
        scope: ['profile', 'email'] 
    }, async (err, user, info) => {
        if (err) {
            return res.redirect('/login?error=google_auth_failed');
        }

        if (!user) {
            return res.redirect('/login?error=no_user_found');
        }

        try {
            // Manually log in the user
            req.login(user, async (loginErr) => {
                if (loginErr) {
                    return res.redirect('/login?error=login_failed');
                }

                // Set session explicitly
                if (req.session) {
                    req.session.user = {
                        userId: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role || 'user',
                        isOAuthUser: true,
                        isNewUser: user.isNewUser
                    };
                }

                if (user.isNewUser) {
                    return res.redirect('/app/complete-profile');
                }

                return res.redirect('/app/user');
            });
        } catch (error) {
            return res.redirect('/login');
        }
    })(req, res, next);
};

/* Callback handler for Google OAuth */
const passportGoogleCallback = async (req, res, next) => {
    passport.authenticate('google', async (err, user, info) => {
        if (err) {
            return res.redirect('/login?error=google_auth_failed');
        }

        if (!user) {
            return res.redirect('/login?error=no_user_found');
        }

        // Manually log in the user
        req.login(user, async (loginErr) => {
            if (loginErr) {
                return res.redirect('/login?error=login_failed');
            }

            
            const userDB = await User.findOne({
                where: { 
                    email: user.email
                }
            });
            
            // Set session explicitly
            if (req.session) {
                req.session.user = {
                    userId: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role || 'user',
                    isOAuthUser: true,
                    isNewUser: userDB.isNewUser
                };
            }

            const clientIp = req.clientIp || 'unknown';
            const token = await userDB.createJWT(clientIp);
            // Set cookie
            
            // Set HTTP-only cookie for security
            if (token) {
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
            }

            if (userDB.isNewUser) {
                return res.redirect('/app/complete-profile');
            }
            return res.redirect('/app/user');
        });
    })(req, res, next);
};

module.exports = {
    passportGoogleLogin,
    passportGoogleCallback
};