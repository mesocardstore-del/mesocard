const { StatusCodes } = require('http-status-codes');
const { UnauthenticatedError, NotFoundError, InternalServerError, BadRequestError } = require('../../errors');
const notificationService = require('../../services/user/NotificationService');
const orderService = require('../../services/OrderService');

const getOrders = async (req, res) => {
    if (!req.user?.userId) throw new UnauthenticatedError('Authentication state invalid');
    
    const orders = await orderService.getOrders(req.user.userId);
    if (!orders) throw new NotFoundError('Orders not found.');
    
    res.status(StatusCodes.OK).json({ 
        message: 'Orders retrieved successfully.',
        results: orders,
        success: true,
     });
}

const createOrder = async (req, res) => {
    if (!req.user?.userId) throw new UnauthenticatedError('Authentication state invalid');
    if (!req.body?.couponCode) req.body.couponCode = null;
    
    const order = await orderService.createOrder(req.user.userId, req.body.couponCode);
    if (!order) throw new InternalServerError('Error creating order')
    
    await notificationService.createNotificationForAllAdmins('[لوحة الادمن] طلب جديد', `رقم الطلب: ${order?.id}`);

    res.status(StatusCodes.CREATED).json({ 
        message: 'Order created successfully.',
        results: order,
        success: true,
     });
}

const getOrderDetails = async (req, res) => {
    if (!req.user?.userId) throw new UnauthenticatedError('Authentication state invalid');
    if (!req.params?.orderId) throw new BadRequestError('Order ID is required.');

    const order = await orderService.getOrderDetails(req.params.orderId, req.user.userId);
    if (!order) throw new NotFoundError('Order not found.');

    res.status(StatusCodes.OK).json({ 
        message: 'Order details retrieved successfully.',
        results: order,
        success: true,
     });
}

module.exports = {
    getOrders,
    createOrder,
    getOrderDetails
}