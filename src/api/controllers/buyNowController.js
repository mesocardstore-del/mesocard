const { StatusCodes } = require('http-status-codes');
const { UnauthenticatedError, NotFoundError, InternalServerError, BadRequestError } = require('../../errors');

const orderService = require('../../services/OrderService');
const cartService = require('../../services/user/CartService');
const notificationService = require('../../services/user/NotificationService');

const buyNow = async (req, res) => {
    if (!req.user?.userId) throw new UnauthenticatedError('Authentication state invalid.');
    if (!req.body?.couponCode) req.body.couponCode = null;
    if (!req.body?.productId) throw new BadRequestError('Product ID is required.');
    if (!req.body?.quantity || req.body.quantity < 1) req.body.quantity = 1;
    if (!req.body?.submittedFields) req.body.submittedFields = null;
    
    const cart = await cartService.clearCart(req.user.userId);
    if (!cart) throw new InternalServerError('Error creating order.');

    const cartItem = await cartService.addItemToCart(req.user.userId, req.body.productId, req.body.quantity, req.body.submittedFields);
    if (!cartItem) throw new InternalServerError('Error creating order.');

    const order = await orderService.createOrder(req.user.userId, req.body.couponCode);
    if (!order) throw new InternalServerError('Error creating order.');
    
    await notificationService.createNotificationForAllAdmins('[لوحة الادمن] طلب جديد', `رقم الطلب: ${order?.id}`);

    res.status(StatusCodes.CREATED).json({
        message: 'Order created successfully.',
        results: order,
        success: true,
     });
}

module.exports = {
    buyNow
}