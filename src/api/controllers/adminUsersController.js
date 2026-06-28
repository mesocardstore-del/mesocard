const { StatusCodes } = require('http-status-codes');
const adminUserService = require('../../services/admin/AdminUserService');

const createUser = async (req, res) => {
    const { firstName, lastName, email, phoneNumber, status, password, role, badge } = req.body;

    const user = await adminUserService.createUser({ firstName, lastName, email, phoneNumber, status, password, role, badge });
    
    res.status(StatusCodes.OK).json({
        success: true,
        message: 'User created successfully',
        results: user
    });
};

const getAllUsers = async (req, res) => {
    const { page = 1, limit = 20, search = '' } = req.params;
    const { role = '', status = '' } = req.query;
    const users = await adminUserService.readAllUsers(page, limit, search, role, status);
    const totalUsersCount = await adminUserService.getTotalUsersCount();
    
    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Users retrieved successfully',
        results: users.users,
        page: users.pagination.page,
        limit: users.pagination.limit,
        count: users.count,
        totalPages: users.pagination.totalPages,
        totalUsersCount
    });
};

const getUserById = async (req, res) => {
    const user = await adminUserService.readUser(req.params?.id);
    
    res.status(StatusCodes.OK).json({
        success: true,
        message: 'User retrieved successfully',
        results: user
    });
};

const updateUser = async (req, res) => {
    const user = await adminUserService.updateUser(req.params?.id, req.body);
    
    res.status(StatusCodes.OK).json({
        success: true,
        message: 'User updated successfully',
        results: user
    });
};

const deleteUser = async (req, res) => {
    const user = await adminUserService.deleteUser(req.params?.id);
    
    res.status(StatusCodes.OK).json({
        success: true,
        message: 'User deleted successfully',
        results: user
    });
};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
}