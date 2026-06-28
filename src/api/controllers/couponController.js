const CouponService = require('../../services/admin/CouponService');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError } = require('../../errors');

const getAllCoupons = async (req, res) => {
    const coupons = await CouponService.getAll();
    
    res.status(StatusCodes.OK).json({
        message: 'Coupons retrieved successfully',
        success: true,
        results: coupons
    });
};

const getOneCoupon = async (req, res) => {
    if(!req?.params?.id) throw new BadRequestError('Coupon ID is required');

    const coupon = await CouponService.getOne(req.params.id);
    
    res.status(StatusCodes.OK).json({
        message: 'Coupon retrieved successfully',
        success: true,
        results: coupon
    });
};

const getOneCouponByCode = async (req, res) => {
    if(!req?.params?.code) throw new BadRequestError('Coupon code is required');

    const coupon = await CouponService.getOneByCode(req.params.code);
    
    res.status(StatusCodes.OK).json({
        message: 'Coupon retrieved successfully',
        success: true,
        results: coupon
    });
};

const createCoupon = async (req, res) => {
    if(!req?.body) throw new BadRequestError('Coupon data is required');

    const coupon = await CouponService.create(req.body);

    res.status(StatusCodes.CREATED).json({
        message: 'Coupon created successfully',
        success: true,
        results: coupon
    });
};

const updateCoupon = async (req, res) => {
    if(!req?.params?.id) throw new BadRequestError('Coupon ID is required');
    if(!req?.body) throw new BadRequestError('Coupon data is required');
    
    const coupon = await CouponService.update(req.params.id, req.body);

    res.status(StatusCodes.OK).json({
        message: 'Coupon updated successfully',
        success: true,
        results: coupon
    });
};

const deleteCoupon = async (req, res) => {
    if(!req?.params?.id) throw new BadRequestError('Coupon ID is required');
    
    await CouponService.delete(req.params.id);

    res.status(StatusCodes.OK).json({
        message: 'Coupon deleted successfully',
        success: true
    });
};

const bulkDeleteCoupon = async (req, res) => {
    if(!req?.body?.ids) throw new BadRequestError('Coupon IDs are required');
    
    await CouponService.bulkDeleteCoupon(req.body.ids);

    res.status(StatusCodes.OK).json({
        message: 'Coupons deleted successfully',
        success: true
    });
};

module.exports = {
    getAllCoupons,
    getOneCoupon,
    getOneCouponByCode,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    bulkDeleteCoupon
}