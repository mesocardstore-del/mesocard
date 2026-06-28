const BankService = require('../../services/admin/BankService');
const { StatusCodes } = require('http-status-codes');

/* Bank */
const getAllBanks = async (req, res) => {
    const { search } = req?.query;
    const banks = await BankService.readBanks(null, false, search);
    
    res.status(StatusCodes.OK).json({
        message: 'All banks retrieved successfully',
        success: true,
        results: banks,
        count: banks?.length,
    });
};

const getActiveBanks = async (req, res) => {
    const banks = await BankService.readBanks(null, true);
    res.status(StatusCodes.OK).json({
        message: 'Active banks retrieved successfully',
        success: true,
        results: banks,
        count: banks?.length,
    });
};

const getBank = async (req, res) => {
    const { id } = req.params;

    const bank = await BankService.readBanks(id, false);
    res.status(StatusCodes.OK).json({
        message: 'Bank retrieved successfully',
        success: true,
        results: bank,
    });
};

const createBank = async (req, res) => {
    const data = { ...req?.body };
    const bank = await BankService.createBank(data);
   
    res.status(StatusCodes.CREATED).json({
        message: 'Bank created successfully',
        success: true,
        results: bank,
    });
};

const updateBank = async (req, res) => {
    const { id } = req.params;
    const data = { ...req?.body };

    const updatedBank = await BankService.updateBank(id, data);

    res.status(StatusCodes.OK).json({
        message: 'Bank updated successfully',
        success: true,
        results: updatedBank,
    });
};

const deleteBank = async (req, res) => {
    const { id } = req.params;

    await BankService.deleteBank(id);
    
    res.status(StatusCodes.OK).json({
        message: 'Bank deleted successfully',
        success: true,
    });
};

module.exports = {
    getAllBanks,
    getActiveBanks,
    getBank,
    createBank,
    updateBank,
    deleteBank
};
