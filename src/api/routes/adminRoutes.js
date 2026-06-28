const express = require('express');
const router = express.Router();
const { upload: uploadCategory } = require('../../config/multer_category');
const { upload: uploadProduct } = require('../../config/multer_product');
const { authenticationRole } = require('../middlewares/authentication');
const { 
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    updateCategoryOrder
} = require('../controllers/categoryController');

const {
    createBank,
    updateBank,
    deleteBank
} = require('../controllers/bankController');

const {
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder
} = require('../controllers/adminOrderController');

const {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
} = require('../controllers/adminUsersController');

const {
    getProductsByCategory,
    getProductDetails,
    searchProducts,
    createProduct,
    deleteProduct,
    getAllProducts,
    getProductsByIds,
    updateProduct,
    updateProductOrder
} = require('../controllers/productController');

const {
    createManualTransaction,
    getManualTransactions,
    getManualTransactionById,
    updateManualTransaction,
    deleteManualTransaction,
    getManualTransactionNoticeImage
} = require('../controllers/manualTransactionController');

const {
    getAllCoupons,
    getOneCoupon,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    bulkDeleteCoupon
} = require('../controllers/couponController');

// /api/v1/admin/manage/category
// public
router.route('/manage/category').get(getAllCategories);
router.route('/manage/category/:id').get(getCategoryById);

// private
router.route('/manage/category')
    .post(
        authenticationRole('admin'), 
        uploadCategory, 
        createCategory
    );
    
router.route('/manage/category/:id')
    .delete(authenticationRole('admin'), deleteCategory)
    .put(authenticationRole('admin'), uploadCategory, updateCategory);

// /api/v1/admin/manage/category/:categoryId/order/:newOrder
router.route('/manage/category/:categoryId/order/:newOrder')
    .patch(authenticationRole('admin'), updateCategoryOrder);

// /api/v1/admin/manage/orders
router.route('/manage/orders')
    .get(authenticationRole('admin'), getAllOrders);

// /api/v1/admin/manage/orders/:id
router.route('/manage/orders/:id')
    .get(authenticationRole('admin'), getOrderById)
    .delete(authenticationRole('admin'), deleteOrder);

// /api/v1/admin/manage/orders/:id/status
router.route('/manage/orders/:id/status')
    .put(authenticationRole('admin'), updateOrderStatus);


// /api/v1/admin/manage/users
// Create
router.route('/manage/users')
    .post(authenticationRole('admin'), createUser);

// Read
router.route('/manage/users/:page/:limit')
    .get(authenticationRole('admin'), getAllUsers);

router.route('/manage/users/:page/:limit/:search')
    .get(authenticationRole('admin'), getAllUsers);

// Update
router.route('/manage/users/:id')
    .get(authenticationRole('admin'), getUserById)
    .put(authenticationRole('admin'), updateUser)
    .delete(authenticationRole('admin'), deleteUser);


// /api/v1/admin/manage/products
router.route('/manage/products')
    .get(authenticationRole('admin'), getAllProducts)
    .post(authenticationRole('admin'), uploadProduct, createProduct);

router.route('/manage/products/bulk')
    .post(authenticationRole('admin'), getProductsByIds);

router.route('/manage/products/search')
    .get(authenticationRole('admin'), searchProducts);

router.route('/manage/products/:productId')
    .get(authenticationRole('admin'), getProductDetails)
    .put(authenticationRole('admin'), uploadProduct, updateProduct)
    .delete(authenticationRole('admin'), deleteProduct);

// /api/v1/admin/manage/products/:productId/order/:newOrder
router.route('/manage/products/:productId/order/:newOrder')
    .patch(authenticationRole('admin'), updateProductOrder);

// /api/v1/admin/manage/bank
// Create Bank
router.route('/manage/bank').post(
    authenticationRole('admin'),
    createBank
);
// Update Bank
router.route('/manage/bank/:id').put(
    authenticationRole('admin'),
    updateBank
);
// Delete Bank
router.route('/manage/bank/:id').delete(
    authenticationRole('admin'),
    deleteBank
);

// /api/v1/admin/manage/manual-payment
router.route('/manage/manual-payments')
    .post(authenticationRole('admin'), createManualTransaction)
    .get(authenticationRole('admin'), getManualTransactions);

// /api/v1/admin/manage/manual-payment/:id
router.route('/manage/manual-payments/:id')
    .get(authenticationRole('admin'), getManualTransactionById)
    .put(authenticationRole('admin'), updateManualTransaction)
    .delete(authenticationRole('admin'), deleteManualTransaction);

router.route('/manage/manual-payments/notice-image/:id')
    .get(authenticationRole('admin'), getManualTransactionNoticeImage);

// /api/v1/admin/manage/coupons
router.route('/manage/coupons')
    .post(authenticationRole('admin'), createCoupon)
    .get(authenticationRole('admin'), getAllCoupons);

router.route('/manage/coupons/:id')
    .get(authenticationRole('admin'), getOneCoupon)
    .put(authenticationRole('admin'), updateCoupon)
    .delete(authenticationRole('admin'), deleteCoupon);

router.route('/manage/coupons/bulk-delete')
    .delete(authenticationRole('admin'), bulkDeleteCoupon);

module.exports = router;