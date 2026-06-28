const express = require('express');
const router = express.Router();

const { authenticationRole, checkSession, logout } = require('../middlewares/authentication');
const { passportGoogleLogin, passportGoogleCallback } = require('../controllers/oauth/googleController');
const { passportFacebookLogin, passportFacebookCallback } = require('../controllers/oauth/facebookController');
const {
    getUserProfile,
    completeUserProfile,
    updateUserNumber
} = require('../controllers/profileController');
const { 
    getAdminPanelPage, 
    getAdminHomeControl,
    getIndexPage,
    getUpdateProfilePage,
    getUserIndexPage,
    getRegisterPage,
    getLoginPage,
    getForgotPasswordPage,
    getResetPasswordPage,
    getMyCartPage,
    getWalletPage,
    getAboutUsPage,
    getMyOrdersPage,
    getBankPage,
    getFavoritesPage,
    getAdminCategoryControl,
    getUserCategoryPage,
    getVisitorCategoryPage,
    getVisitorAboutPage,
    getAdminOrderControl,
    getAdminUserControl,
    getAdminProductControl,
    getAdminCouponControl,
    getAdminBankControl,
    getUserAddBalancePage,
    getAdminManualPaymentControl,
    viewManualPaymentNotice,
    viewOrderForms,
    viewManualPaymentInfo
} = require('../controllers/clientController');

const { 
    updateMarquee,
    addSliderImage,
    getSliderData,
    updateSliderImage,
    deleteSliderImage,
 } = require('../controllers/admin/adminPanelController');

router.route('/change-language').post((req, res) => {
    const { language } = req.body;
    if (['en', 'ar'].includes(language)) {
        req.session.lang = language;
        req.i18n.changeLanguage(language);
        res.cookie('lang', language, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'prod',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
        res.status(200).json({ success: true });
    } else {
        res.status(400).json({ success: false, message: 'Invalid language' });
    }
});

router.route('/').get(getIndexPage); // Client (No Authentication) Index Page

/* User (Authentication Required) Routes */
router.route('/app/user').get(checkSession, getUserIndexPage); // User (Authentication Required) Index Page
router.route('/app/profile').get(checkSession, getUserProfile); // User (Authentication Required) Index Page
router.route('/app/update-profile').get(checkSession, getUpdateProfilePage); // User (Authentication Required) Index Page
router.route('/app/complete-profile')
.get(checkSession, completeUserProfile)
.post(checkSession, updateUserNumber); // User (Authentication Required) Index Page
router.route('/app/cart').get(checkSession, getMyCartPage); // User cart page
router.route('/app/wallet').get(checkSession, getWalletPage); // User cart page
router.route('/app/orders').get(checkSession, getMyOrdersPage); // User orders page
router.route('/app/about').get(checkSession, getAboutUsPage); // User orders page


router.route('/register').get(getRegisterPage); // Client (No Authentication) Register Page
router.route('/forgot-password').get(getForgotPasswordPage); // Client (No Authentication) Forgot Password Page
router.route('/reset-password/:token')
    .get(getResetPasswordPage)
router.route('/login').get(getLoginPage); // Client (No Authentication) Login Page
router.get('/logout', logout);

/* Favorites */
router.route('/app/favorites')
    .get(checkSession, getFavoritesPage);

// Google OAuth Routes
router.get('/auth/google', passportGoogleLogin);
router.get('/auth/google/callback', passportGoogleCallback);

// Facebook OAuth Routes
router.get('/auth/facebook', passportFacebookLogin);
router.get('/auth/facebook/callback', passportFacebookCallback);


/* Admin (Authentication Required) Routes */
// /app/admin/panel
router.route('/app/admin/panel')
    .get(checkSession, authenticationRole('admin'), getAdminPanelPage);

router.route('/app/admin/panel/home')
    .get(checkSession, authenticationRole('admin'), getAdminHomeControl);

router.route('/app/admin/panel/home/update-marquee')
    .put(checkSession, authenticationRole('admin'), updateMarquee);
router.route('/app/admin/panel/home/slider')
    .get(checkSession, authenticationRole('admin'), getSliderData)
    .post(checkSession, authenticationRole('admin'), addSliderImage)
router.route('/app/admin/panel/home/slider/:id')
    .delete(checkSession, authenticationRole('admin'), deleteSliderImage)
router.route('/app/admin/panel/home/update-slider')
    .put(checkSession, authenticationRole('admin'), updateSliderImage)

router.route('/app/admin/panel/categories')
    .get(checkSession, authenticationRole('admin'), getAdminCategoryControl)
    .post(checkSession, authenticationRole('admin'));

router.route('/category/:id')
    .get(checkSession, getUserCategoryPage);

router.route('/visitors/category/:id')
    .get(getVisitorCategoryPage);
    
router.route('/visitors/about')
    .get(getVisitorAboutPage);

router.route('/app/admin/panel/orders')
    .get(checkSession, authenticationRole('admin'), getAdminOrderControl);

router.route('/app/admin/panel/users')
    .get(checkSession, authenticationRole('admin'), getAdminUserControl);

// /app/admin/panel/products
router.route('/app/admin/panel/products')
    .get(checkSession, authenticationRole('admin'), getAdminProductControl);

// /app/admin/panel/coupons
router.route('/app/admin/panel/coupons')
    .get(checkSession, authenticationRole('admin'), getAdminCouponControl);

router.route('/app/admin/panel/banks')
    .get(checkSession, authenticationRole('admin'), getAdminBankControl);

router.route('/app/user/add-balance')
    .get(checkSession, getUserAddBalancePage);

router.route('/bank/:id')
    .get(checkSession, getBankPage);

router.route('/app/admin/panel/manual-payment')
    .get(checkSession, authenticationRole('admin'), getAdminManualPaymentControl);

router.route('/app/admin/panel/manual-payment/noticeImage/:id')
    .get(checkSession, authenticationRole('admin'), viewManualPaymentNotice);

router.route('/app/admin/panel/orders/:id')
    .get(checkSession, authenticationRole('admin'), viewOrderForms);

router.route('/app/admin/panel/manual-payment/info/:id')
    .get(checkSession, authenticationRole('admin'), viewManualPaymentInfo);

    
module.exports = router;