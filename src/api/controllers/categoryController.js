const adminCategoryService = require("../../services/admin/AdminCategoryService");
const { StatusCodes } = require("http-status-codes");

const {
    createCategoryValidator, 
    updateCategoryValidator
} = require("../../validation/categoryValidation");

const { 
    NotFoundError,
    InternalServerError,
    BadRequestError
 } = require("../../errors");

const getAllCategories = async (req, res) => {
    const categories = await adminCategoryService.readCategory(null, true);

    return res.status(StatusCodes.OK).json({
        message: categories ? 'Categories retrieved successfully.' : 'No categories found.',
        results: categories,
        total: categories ? categories.length : 0,
        success: true,
    });
}

const getCategoryById = async (req, res) => {
    if (!req.params.id || typeof req.params.id !== 'string') throw new BadRequestError('Category ID is required.');
    const category = await adminCategoryService.readCategory(req.params.id);
    if (!category) throw new NotFoundError('Category not found.');
    
    return res.status(StatusCodes.OK).json({
        message: 'Category retrieved successfully.',
        results: category,
        success: true,
    });
}

const createCategory = async (req, res) => {
    try {
        // Combine body and file data
        const categoryData = { ...req.body };
        
        // If a file was uploaded, add its path to the category data
        if (req.file) {
            categoryData.categoryImage = `/static/images/categories/${req.file.filename}`;
        }
        
        // Validate the category data
        const { error } = createCategoryValidator.validate(categoryData);
        if (error) throw new BadRequestError(error.details[0].message);
        
        const category = await adminCategoryService.createCategory(categoryData);
        if (!category) throw new InternalServerError('Failed to create category.');
        
        return res.status(StatusCodes.CREATED).json({
            message: 'Category created successfully.',
            results: category,
            success: true,
        });
    } catch (error) {
        console.error('Error creating category:', error);
        throw error; // This will be caught by your error handling middleware
    }
}

const updateCategory = async (req, res) => {
    try {
        // Combine body and file data
        const updateData = { ...req.body };
        
        // If a file was uploaded, add its path to the update data
        if (req.file) {
            updateData.categoryImage = `/static/images/categories/${req.file.filename}`;
        }
        
        // Validate the update data
        const { error } = updateCategoryValidator.validate(updateData);
        if (error) throw new BadRequestError(error.details[0].message);
        
        const category = await adminCategoryService.readCategory(req.params.id);
        if (!category) throw new NotFoundError('Category not found.');
        
        const updatedCategory = await adminCategoryService.updateCategory(req.params.id, updateData);
        if (!updatedCategory) throw new InternalServerError('Failed to update category.');
        
        return res.status(StatusCodes.OK).json({
            message: 'Category updated successfully.',
            results: updatedCategory,
            success: true,
        });
    } catch (error) {
        console.error('Error updating category:', error);
        throw error; // This will be caught by your error handling middleware
    }
}

const updateCategoryOrder = async (req, res) => {
    if (!req.params?.categoryId) throw new BadRequestError('Category ID is required.');
    if (!req.params?.newOrder) throw new BadRequestError('New order is required.');
    
    const categoryId = req.params.categoryId;
    const newOrder = req.params.newOrder;
    
    await adminCategoryService.updateCategoryOrder(categoryId, newOrder);
    
    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Category order updated successfully.'
    });
};

const deleteCategory = async (req, res) => {
    if (!req.params.id || typeof req.params.id !== 'string') throw new BadRequestError('Category ID is required.');
    const category = await adminCategoryService.readCategory(req.params.id);
    if (!category) throw new NotFoundError('Category not found.');
    
    const deletedCategory = await adminCategoryService.deleteCategory(req.params.id);
    if (!deletedCategory) throw new InternalServerError('Failed to delete category.');
    
    return res.status(StatusCodes.OK).json({
        message: 'Category deleted successfully.',
        results: deletedCategory,
        success: true,
    });
}


module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    updateCategoryOrder,
    deleteCategory
}