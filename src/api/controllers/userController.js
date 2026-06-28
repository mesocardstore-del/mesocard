const { StatusCodes } = require('http-status-codes');
const userValidation = require('../../validation/userValidation');
const cartService = require('../../services/user/CartService');
const notificationService = require('../../services/user/NotificationService');
const manualTransactionService = require('../../services/ManualTransactionService');
const adminUserService = require('../../services/admin/AdminUserService');
const { 
    UnauthenticatedError, 
    InternalServerError, 
    NotFoundError, 
    BadRequestError
} = require('../../errors');

/* - Cart - */
const createCart = async (req, res) => {
    if (!req.user?.userId) throw new UnauthenticatedError('Authentication state invalid');

    const cart = await cartService.createCart(req.user.userId);
    if (!cart) throw new InternalServerError('Failed to create cart.');

    res.status(StatusCodes.CREATED).json({ 
        message: 'Cart created successfully.',
        results: cart,
        success: true,
     });
};

const getCart = async (req, res) => {
    if (!req.user?.userId) throw new UnauthenticatedError('Authentication state invalid');

    const cart = await cartService.getCart(req.user.userId);
    if (!cart) throw new NotFoundError('Cart not found.');

    res.status(StatusCodes.OK).json({
        message: 'Cart retrieved successfully.',
        results: cart,
        success: true,
     });
};

const addItemToCart = async (req, res) => {
    if (!req.user?.userId) throw new UnauthenticatedError('Authentication state invalid');
    if (!req.body?.productId) throw new BadRequestError('Product ID is required.');
    if (!req.body?.quantity) req.body.quantity = 1;
    if (!req.body?.submittedFields) req.body.submittedFields = null;

    const { error } = userValidation.addToCartValidator.validate(req.body);
    if (error) throw new BadRequestError(error.details[0].message);

    const cart = await cartService.addItemToCart(req.user.userId, req.body.productId, req.body.quantity, req.body.submittedFields);
    if (!cart) throw new InternalServerError('Failed to add item to cart.');
    
    res.status(StatusCodes.OK).json({
        message: 'Item added to cart successfully.',
        results: cart,
        success: true,
     });
};

const removeItemFromCart = async (req, res) => {
    if (!req.user?.userId) throw new UnauthenticatedError('Authentication state invalid');
    if(!req.params?.productId) throw new BadRequestError('Product ID is required.');

    const cart = await cartService.removeItemFromCart(req.user.userId, req.params.productId);
    if (!cart) throw new InternalServerError('Failed to remove item from cart.');
    
    res.status(StatusCodes.OK).json({
        message: 'Item removed from cart successfully.',
        results: cart,
        success: true,
     });
};

const updateQuantity = async (req, res) => {
    if (!req.user?.userId) throw new UnauthenticatedError('Authentication state invalid');
    if(!req.body?.productId) throw new BadRequestError('Product ID is required.');
    if(!req.body?.change) throw new BadRequestError('Change is required.');

    const cart = await cartService.updateQuantity(req.user.userId, req.body.productId, req.body.change);
    if (!cart) throw new InternalServerError('Failed to update quantity.');
    
    res.status(StatusCodes.OK).json({
        message: 'Quantity updated successfully.',
        results: cart,
        success: true,
     });
};

const getCartCount = async (req, res) => {
    if (!req.user?.userId) throw new UnauthenticatedError('Authentication state invalid');
    const cart = await cartService.getCart(req.user.userId);
    if (!cart) throw new NotFoundError('Cart not found.');

    const count = cart.length || 0;
    return res.status(StatusCodes.OK).json({
        success: true,
        message: 'Cart count retrieved successfully',
        results: [{ count }]
    });
};

/* End Cart */

/* - Notification - */
const createNotification = async (req, res) => {
    if (!req.user?.userId) throw new UnauthenticatedError('Authentication state invalid');
    if (!req.body?.title) throw new UnauthenticatedError('Title is required.');
    if (!req.body?.message) throw new UnauthenticatedError('Message is required.');

    let userId = req.user?.userId;
    if (req?.body?.email) {
        const user = await adminUserService.readUserByEmail(req.body?.email);
        if (!user) throw new NotFoundError('User not found.');
        userId = user?.id;
    }

    const notification = await notificationService.createNotification(userId, req.body?.title, req.body?.message);
    if (!notification) throw new InternalServerError('Failed to create notification.');
    
    res.status(StatusCodes.CREATED).json({ 
        message: 'Notification created successfully.',
        results: notification,
        success: true,
     });
};

const createNotificationForAllUsers = async (req, res) => {
    if (!req.user?.userId) throw new UnauthenticatedError('Authentication state invalid');
    if (!req.body?.title) throw new UnauthenticatedError('Title is required.');
    if (!req.body?.message) throw new UnauthenticatedError('Message is required.');

    const notification = await notificationService.createNotificationForAllUsers(req.body?.title, req.body?.message);
    if (!notification) throw new InternalServerError('Failed to create notification for all users.');
    
    res.status(StatusCodes.CREATED).json({ 
        message: `Notification sent to ${notification?.count} users.`,
        count: notification?.count,
        success: true,
     });
};

const getNotifications = async (req, res) => {
    if (!req.user?.userId) throw new UnauthenticatedError('Authentication state invalid');
    const { notifications, unreadCount } = await notificationService.getNotifications(req.user.userId);
    if (!notifications) throw new NotFoundError('Notifications not found.');
    
    res.status(StatusCodes.OK).json({
        message: 'Notifications retrieved successfully.',
        results: notifications,
        unreadCount,
        success: true,
     });
};

const deleteNotification = async (req, res) => {
    if (!req.user?.userId) throw new UnauthenticatedError('Authentication state invalid');
    const notification = await notificationService.deleteNotification(req.user.userId, req.body.notificationId);
    if (!notification) throw new NotFoundError('Notification not found.');
    
    res.status(StatusCodes.OK).json({ 
        message: 'Notification deleted successfully.',
        results: notification,
        success: true,
     });
};

const readNotificationById = async (req, res) => {  
    if (!req.user?.userId) throw new UnauthenticatedError('Authentication state invalid');
    if (!req?.params?.notificationId) throw new BadRequestError('Notification ID is required.');

    const notification = await notificationService.markNotificationAsRead(req.user.userId, req?.params?.notificationId);
    if (!notification) throw new NotFoundError('Notification not found.');
    
    res.status(StatusCodes.OK).json({ 
        message: 'Notification marked as read successfully.',
        results: notification,
        success: true,
     });
};

const readNotifications = async (req, res) => {
    if (!req.user?.userId) throw new UnauthenticatedError('Authentication state invalid');
    const notification = await notificationService.markAllAsRead(req.user.userId);
    if (!notification) throw new NotFoundError('Notifications not found.');
    
    res.status(StatusCodes.OK).json({ 
        message: 'Notifications marked as read successfully.',
        results: notification,
        success: true,
     });
};

const unreadNotificationCount = async (req, res) => {
    if (!req.user?.userId) throw new UnauthenticatedError('Authentication state invalid');
    
    let count = await notificationService.getUnreadCount(req.user.userId);
    if (!count) count = 0;
    
    res.status(StatusCodes.OK).json({ 
        message: 'Unread notification count retrieved successfully.',
        results: count,
        success: true,
     });
};
/* End Notification */

/* - Manual Transaction - */
const createManualTransaction = async (req, res) => {
    if (!req.user?.userId) throw new UnauthenticatedError('Authentication state invalid');

    const manualTransaction = await manualTransactionService.createManualTransaction(req.user.userId, req?.body);
    if (!manualTransaction) throw new InternalServerError('Failed to create manual transaction.');
    
    res.status(StatusCodes.CREATED).json({ 
        message: 'Manual transaction created successfully.',
        results: manualTransaction,
        success: true,
     });
};
/* End Manual Transaction */

module.exports = {
    createCart,
    getCart,
    addItemToCart,
    updateQuantity,
    removeItemFromCart,
    getCartCount,
    createNotification,
    createNotificationForAllUsers,
    getNotifications,
    deleteNotification,
    readNotificationById,
    readNotifications,
    unreadNotificationCount,
    createManualTransaction,
};
