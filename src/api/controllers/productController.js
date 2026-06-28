const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../../errors');
const productService = require('../../services/admin/ProductService');
const path = require('path');
const fs = require('fs');

const getProductsByCategory = async (req, res) => {
    if (!req.query?.categoryId) throw new BadRequestError('Category ID is required.');

    const categoryId = req.query.categoryId;
    const products = await productService.readProductsByCategory(categoryId);

    if (!products) throw new NotFoundError('Products not found.');

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Products retrieved successfully.',
        results: products
    });
};

const getAllProducts = async (req, res) => {
    const products = await productService.readAllProducts();
    
    if (!products) throw new NotFoundError('No products found.');
    
    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Products retrieved successfully.',
        results: products
    });
};

const searchProducts = async (req, res) => {
    if (!req.query?.q) throw new BadRequestError('Search query is required.');

    const query = req.query.q;
    const products = await productService.readProducts(query);

    if (!products) throw new NotFoundError('No products found.');

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Products retrieved successfully.',
        results: products
    });
};

const getProductsByIds = async (req, res) => {
    if (!req?.body?.ids) throw new BadRequestError('Product IDs is required.');

    const ids = req.body.ids;
    const products = await productService.readProductsByIds(ids);

    if (!products) throw new NotFoundError('Products not found.');

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Products retrieved successfully.',
        results: products
    });
}

const getProductDetails = async (req, res) => {
    if (!req.params?.productId) throw new BadRequestError('Product ID is required.');

    const productId = req.params.productId;
    const product = await productService.readProduct(productId);

    if (!product) throw new NotFoundError('Product not found.');

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Product retrieved successfully.',
        results: product
    });
};

const createProduct = async (req, res) => {
    if (!req.body) throw new BadRequestError('Missing required fields.');
    
    // Get file path if file was uploaded
    let imagePath = '';
    if (req.file) {
        // Convert the path to use forward slashes for consistency
        imagePath = req.file.path.replace(/\\/g, '/');
        // Make it a relative path from the public directory
        const publicPath = path.join(process.cwd(), 'client', 'public').replace(/\\/g, '/');
        imagePath = imagePath.replace(publicPath, '');
    }
    
    // Prepare product data
    const productData = {
        ...req.body,
        imagePath,
        isAvailable: req.body?.isAvailable?.includes('true') || req.body?.isAvailable?.includes('on') || req.body?.isAvailable === true,
        dialogHasForms: req.body?.dialogHasForms?.includes('true') || req.body?.dialogHasForms?.includes('on') || req.body?.dialogHasForms === true,
        dialogForms: req.body?.dialogForms,
        price: parseFloat(req.body?.price) || 0,
        price_jod: parseFloat(req.body?.price_jod) || 0,
        minUnits: req.body?.minUnits || 1
    };
    
    const product = await productService.createProduct(productData);

    res.status(StatusCodes.CREATED).json({
        success: true,
        message: 'Product created successfully.',
        results: product
    });
};

const updateProduct = async (req, res) => {
    if (!req.params?.productId) throw new BadRequestError('Product ID is required.');
    if (!req.body) throw new BadRequestError('Missing required fields.');
    
    const productId = req.params.productId;
    
    // Get file path if file was uploaded
    let imagePath = '';
    if (req.file) {
        // Convert the path to use forward slashes for consistency
        imagePath = req.file.path.replace(/\\/g, '/');
        // Make it a relative path from the public directory
        const publicPath = path.join(process.cwd(), 'client', 'public').replace(/\\/g, '/');
        imagePath = imagePath.replace(publicPath, '');
        
        // Delete old image if it exists
        const oldProduct = await productService.readProduct(productId);
        if (oldProduct && oldProduct.image) {
            const oldImagePath = path.join(process.cwd(), 'client', 'public', oldProduct.image);
            if (fs.existsSync(oldImagePath)) {
                if (!oldImagePath.includes('default-product.jpg')) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        }
    }
    
    // Prepare update data
    const updateData = {
        ...req.body,
        isAvailable: req.body?.isAvailable?.includes('true') || req.body?.isAvailable?.includes('on') || req.body?.isAvailable === true,
        dialogHasForms: req.body?.dialogHasForms?.includes('true') || req.body?.dialogHasForms?.includes('on') || req.body?.dialogHasForms === true,
        dialogForms: req.body?.dialogForms,
        price: parseFloat(req.body?.price) || 0,
        price_jod: parseFloat(req.body?.price_jod) || 0,
        minUnits: req.body?.minUnits || 1
    };
    
    // Only update image path if a new image was uploaded
    if (imagePath) {
        updateData.imagePath = imagePath;
    }
    
    const product = await productService.updateProduct(productId, updateData);
    
    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Product updated successfully.',
        results: product
    });
};

const updateProductOrder = async (req, res) => {
    if (!req.params?.productId) throw new BadRequestError('Product ID is required.');
    if (!req.params?.newOrder) throw new BadRequestError('New order is required.');
    
    const productId = req.params.productId;
    const newOrder = req.params.newOrder;
    
    await productService.updateProductOrder(productId, newOrder);
    
    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Product order updated successfully.'
    });
};

const deleteProduct = async (req, res) => {
    if (!req.params?.productId) throw new BadRequestError('Product ID is required.');
    
    const productId = req.params.productId;
    
    // Get product to delete its image
    const product = await productService.readProduct(productId);
    if (product && product.image) {
        const imagePath = path.join(process.cwd(), 'client', 'public', product.image);
        if (fs.existsSync(imagePath)) {
            if (!imagePath.includes('default-product.jpg')) {
                fs.unlinkSync(imagePath);
            }
        }
    }
    
    await productService.deleteProduct(productId);
    
    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Product deleted successfully.'
    });
};

module.exports = {
    getProductsByCategory,
    getProductDetails,
    searchProducts,
    createProduct,
    updateProduct,
    updateProductOrder,
    deleteProduct,
    getAllProducts,
    getProductsByIds
}