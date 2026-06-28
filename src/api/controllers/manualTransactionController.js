const { StatusCodes } = require('http-status-codes');
const { UnauthenticatedError, BadRequestError } = require('../../errors');
const path = require('path');
const fs = require('fs');

const manualTransactionService = require('../../services/ManualTransactionService');

const createManualTransaction = async (req, res) => {
    if (!req.user?.userId) throw new UnauthenticatedError('Authentication state invalid');

    const manualTransaction = await manualTransactionService.createManualTransaction(req.user.userId, req?.body);
    
    res.status(StatusCodes.CREATED).json({ 
        message: 'Manual transaction created successfully.',
        results: manualTransaction,
        success: true,
     });
};

const getManualTransactions = async (req, res) => {
    if (!req.user?.userId) throw new UnauthenticatedError('Authentication state invalid');

    const manualTransactions = await manualTransactionService.getManualTransactions();
    
    res.status(StatusCodes.OK).json({ 
        message: 'Manual transactions retrieved successfully.',
        results: manualTransactions,
        success: true,
     });
}

const getManualTransactionById = async (req, res) => {
    if (!req.user?.userId) throw new UnauthenticatedError('Authentication state invalid');
    if (!req.params?.id) throw new BadRequestError('Manual Transaction ID is required');

    const manualTransaction = await manualTransactionService.getManualTransactions(req?.params.id);
    
    res.status(StatusCodes.OK).json({ 
        message: 'Manual transaction retrieved successfully.',
        results: manualTransaction,
        success: true,
     });
}

const updateManualTransaction = async (req, res) => {
    if (!req.user?.userId) throw new UnauthenticatedError('Authentication state invalid');
    if (!req.params.id) throw new BadRequestError('Manual Transaction ID is required');

    const manualTransaction = await manualTransactionService.updateManualTransaction(req?.params.id, req?.body);
    
    res.status(StatusCodes.OK).json({ 
        message: 'Manual transaction updated successfully.',
        results: manualTransaction,
        success: true,
     });
}

const deleteManualTransaction = async (req, res) => {
    if (!req.user?.userId) throw new UnauthenticatedError('Authentication state invalid');
    if (!req.params.id) throw new BadRequestError('Manual Transaction ID is required');

    const manualTransaction = await manualTransactionService.deleteManualTransaction(req?.params.id);
    
    res.status(StatusCodes.OK).json({ 
        message: 'Manual transaction deleted successfully.',
        results: manualTransaction,
        success: true,
     });
}

const getManualTransactionNoticeImage = async (req, res) => {
    if (!req?.user?.userId) throw new UnauthenticatedError('Authentication state invalid');
    if (!req?.params?.id) throw new BadRequestError('Manual Transaction ID is required');
    const manualTransaction = await manualTransactionService.getManualTransactions(req?.params.id);
    if (manualTransaction?.noticeImagePath && manualTransaction?.noticeImagePath?.length > 0) {
        const fullPath = path.join(__dirname, '..' , '..', '..', 'client', 'private_uploads', 'bank_notice_image', manualTransaction?.noticeImagePath);
        if (!fs.existsSync(fullPath)) {
            return res.status(StatusCodes.NOT_FOUND).json({ 
                message: 'Manual transaction notice image not found.',
                success: false,
             });
        }

        res.sendFile(fullPath);
    } else {
        res.status(StatusCodes.NOT_FOUND).json({ 
            message: 'Manual transaction notice image not found.',
            success: false,
         });
    }
}

module.exports = {
    createManualTransaction,
    getManualTransactions,
    getManualTransactionById,
    updateManualTransaction,
    deleteManualTransaction,
    getManualTransactionNoticeImage
}
