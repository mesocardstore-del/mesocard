const { StatusCodes } = require('http-status-codes');
const adminOrderService = require('../../services/admin/AdminOrderService');
const { BadRequestError, NotFoundError } = require('../../errors');

const getAllOrders = async (req, res) => {
    const orders = await adminOrderService.getAllOrders();
    if (!orders) throw new NotFoundError('Orders not found');
    
    res.status(StatusCodes.OK).json({
        success: true,
        count: orders.length,
        data: orders
    });
};

const getOrderById = async (req, res) => {
    if(!req.params?.id) throw new BadRequestError('Order ID is required');

    const order = await adminOrderService.getOrderById(req.params.id);
    if (!order) throw new NotFoundError('Order not found');
    
    res.status(StatusCodes.OK).json({
        success: true,
        data: order
    });
};

const updateOrderStatus = async (req, res) => {
    if(!req.params?.id) throw new BadRequestError('Order ID is required');
    const { status, message } = req.body;
    
    if (!status) {
        throw new BadRequestError('Status is required');
    }
    
    const order = await adminOrderService.updateOrderStatus(
        req.params.id, 
        status, 
        message
    );
    
    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Order status updated successfully',
        data: order
    });
};

const deleteOrder = async (req, res) => {
    if(!req.params?.id) throw new BadRequestError('Order ID is required');
    await adminOrderService.deleteOrder(req.params.id);
    
    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Order deleted successfully'
    });
};

module.exports = {
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder
};
