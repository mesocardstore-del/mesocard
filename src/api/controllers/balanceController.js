const { StatusCodes } = require('http-status-codes');
const User = require('../../models/User');
const { BadRequestError, UnauthenticatedError } = require('../../errors');

const addBalance = async (req, res) => {
    if (!req.user?.userId) throw new UnauthenticatedError('Authentication state invalid');
    
    const { amount } = req.body;
    const userId = req.user.userId;

    // Validate amount
    if (!amount || amount <= 0) {
        throw new BadRequestError('Invalid amount');
    }

    // Update user balance
    const user = await User.findByIdAndUpdate(
        userId, 
        { $inc: { balance: parseFloat(amount) } }, 
        { new: true }
    );

    if (!user) {
        throw new BadRequestError('User not found');
    }

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Balance added successfully',
        newBalance: user.balance
    });
}

const withdrawBalance = async (req, res) => {
    if (!req.user?.userId) throw new UnauthenticatedError('Authentication state invalid');
    
    const { amount } = req.body;
    const userId = req.user.userId;

    // Validate amount
    if (!amount || amount <= 0) {
        throw new BadRequestError('Invalid amount');
    }

    // Update user balance
    const user = await User.findByIdAndUpdate(
        userId, 
        { $dec: { balance: parseFloat(amount) } }, 
        { new: true }
    );

    if (!user) {
        throw new BadRequestError('User not found');
    }

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Balance removed successfully',
        newBalance: user.balance
    });
}

/**
 * Get current user balance
 */
const getBalance = async (req, res) => {
    if (!req.user?.userId) throw new UnauthenticatedError('Authentication state invalid');
    const userId = req.user.userId;

    const user = await User.findById(userId).select('balance');

    if (!user) {
        throw new BadRequestError('User not found');
    }

    res.status(StatusCodes.OK).json({
        success: true,
        balance: user.balance
    });
}

module.exports = {
    addBalance,
    withdrawBalance,
    getBalance
};
