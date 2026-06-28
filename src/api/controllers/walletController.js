const walletService = require('../../services/user/WalletService');
const { BadRequestError, UnauthenticatedError } = require('../../errors');
const { StatusCodes } = require('http-status-codes');

const getWalletStatics = async (req, res) => {
    if (!req.user?.userId) throw new UnauthenticatedError('Authentication state invalid');
    const userId = req.user.userId;
    const statics = await walletService.getStatics(userId);
    if (!statics) throw new BadRequestError('User not found');

    const transactions = await walletService.getTransactions(userId);

    res.status(StatusCodes.OK).json({ 
        message: 'Wallet statics retrieved successfully.',
        results: statics,
        transactions,
        success: true,
    });
};

module.exports = {
    getWalletStatics
};
