const express = require('express');
const router = express.Router();
const { authentication } = require('../middlewares/authentication');
const {
    getCart,
    addItemToCart,
    removeItemFromCart,
    updateQuantity,
    createNotification,
    getNotifications,
    readNotificationById,
    deleteNotification,
    readNotifications,
    unreadNotificationCount,
    getCartCount,
    createManualTransaction,
    createNotificationForAllUsers,
} = require('../controllers/userController');

const {
    getBalance,
    addBalance,
    withdrawBalance
} = require('../controllers/balanceController');

const {
    getOrders,
    createOrder,
    getOrderDetails
} = require('../controllers/orderController');

const {
    getProductsByCategory,
    getProductDetails
} = require('../controllers/productController');

const {
    getAllBanks, 
    getActiveBanks, 
    getBank
} = require('../controllers/bankController');

const {
    getOneCouponByCode,
} = require('../controllers/couponController');

const {
    getFavorites,
    addFavorite,
    deleteFavorite,
    getFavoriteState
} = require('../controllers/favoriteController');

const {
    buyNow
} = require('../controllers/buyNowController');

const {
    updateUserProfile
} = require('../controllers/profileController');

const {
    upload
} = require('../../config/multer_profile');

const {
    getWalletStatics
} = require('../controllers/walletController');

/* Cart */
// /api/v1/user/cart
router.route('/cart/')
    .get(authentication, getCart)
router.route('/cart/add')
    .post(authentication, addItemToCart);
router.route('/cart/:productId')
    .delete(authentication, removeItemFromCart);
router.route('/cart/update-quantity')
    .post(authentication, updateQuantity);
router.route('/cart/count')
    .get(authentication, getCartCount);
router.route('/cart/checkout')
    .post(authentication, createOrder);


/* Buy Now */
// /api/v1/user/buy-now
router.route('/buy-now')
    .post(authentication, buyNow);

/* Orders */
// /api/v1/user/orders
router.route('/orders')
    .get(authentication, getOrders);
router.route('/orders/:orderId')
    .get(authentication, getOrderDetails);


/* Notifications */
// /api/v1/user/notifications
router.route('/notifications')
    .get(authentication, getNotifications);
router.route('/notifications/create')
    .post(authentication, createNotification);
router.route('/notifications/create/everyone')
    .post(authentication, createNotificationForAllUsers);
router.route('/notifications/delete')
    .delete(authentication, deleteNotification);
router.route('/notifications/:notificationId/read')
    .post(authentication, readNotificationById);
router.route('/notifications/read')
    .post(authentication, readNotifications);
router.route('/notifications/unread-count')
    .get(authentication, unreadNotificationCount);

/* Profile */
// /api/v1/user/profile/update
router.route('/profile/update')
    .post(authentication, upload, updateUserProfile);


/* Wallet */
// /api/v1/user/wallet/statics
router.route('/wallet/statics')
    .get(authentication, getWalletStatics);

/* Balance */
// /api/v1/user/balance
router.route('/balance')
    .get(authentication, getBalance);
router.route('/balance/add')
    .post(authentication, addBalance);
router.route('/balance/withdraw')
    .post(authentication, withdrawBalance);


/* Bank */
// /api/v1/user/bank
// Public routes
router.get('/bank', authentication, getAllBanks);
router.get('/bank/active', authentication, getActiveBanks);
router.get('/bank/:id', authentication, getBank);


/* Products */
// /api/v1/user/products
router.route('/products')
    .get(authentication, getProductsByCategory);
router.route('/products/:productId')
    .get(authentication, getProductDetails);

/* Manual Transaction */
// /api/v1/user/manual-transaction
router.route('/manual-transaction')
    .post(authentication, createManualTransaction);

/* Coupons */
// /api/v1/user/coupons/:code
router.route('/coupons/:code')
    .get(authentication, getOneCouponByCode);


/* Favorites */
// /api/v1/user/favorites
router.route('/favorites')
    .get(authentication, getFavorites);
router.route('/favorites/:productId')
    .get(authentication, getFavoriteState);
router.route('/favorites/add/:id')
    .post(authentication, addFavorite);
router.route('/favorites/:id')
    .delete(authentication, deleteFavorite);

module.exports = router;
