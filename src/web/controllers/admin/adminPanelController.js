const { BadRequestError, UnauthenticatedError } = require("../../../errors");
const { StatusCodes } = require("http-status-codes");
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const Category = require('../../../models/Category');


// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', '..', '..', '..', 'client', 'public', 'static', 'images', 'slider'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
}).single('sliderImage');

const updateMarquee = async (req, res) => {
    if (!req.user?.role === 'admin') throw new UnauthenticatedError('Authentication state invalid');
    
    const { marqueeText } = req.body;
    if (!marqueeText) throw new BadRequestError('Marquee text is required');
    if (!marqueeText.trim()) throw new BadRequestError('Marquee text is required');
    
    fs.writeFileSync(path.join(__dirname, '..', '..', '..', '..', 'client', 'public', 'static', 'data', 'marqueeData.json'), JSON.stringify({ marqueeText }));
    res.status(StatusCodes.OK).json({
        message: 'Marquee text updated successfully',
        success: true,
    });
}

const getSliderData = async (req, res) => {
    if (!req.user?.role === 'admin') throw new UnauthenticatedError('Authentication state invalid');
    
    try {
        const sliderDataPath = path.join(__dirname, '..', '..', '..', '..', 'client', 'public', 'static', 'data', 'sliderData.json');
        let sliderData = [];
        
        if (fs.existsSync(sliderDataPath)) {
            const data = fs.readFileSync(sliderDataPath, 'utf8');
            sliderData = JSON.parse(data);
        }
        
        res.status(StatusCodes.OK).json({
            data: sliderData,
            success: true,
        });
    } catch (error) {
        console.error('Error reading slider data:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Failed to retrieve slider data',
            success: false,
        });
    }
}

const addSliderImage = async (req, res) => {
    if (!req.user?.role === 'admin') throw new UnauthenticatedError('Authentication state invalid');
    
    upload(req, res, async function (err) {
        if (err) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: err.message,
                success: false,
            });
        }
        
        try {
            const { title, description, altText } = req.body;
            
            if (!req.file) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: 'Image file is required',
                    success: false,
                });
            }
            
            if (!title || !description || !altText) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: 'Title, description, and alt text are required',
                    success: false,
                });
            }
            
            const sliderDataPath = path.join(__dirname, '..', '..', '..', '..', 'client', 'public', 'static', 'data', 'sliderData.json');
            let sliderData = [];
            
            if (fs.existsSync(sliderDataPath)) {
                const data = fs.readFileSync(sliderDataPath, 'utf8');
                sliderData = JSON.parse(data);
            }
            
            const newSlide = {
                id: uuidv4(),
                imageUrl: `/static/images/slider/${req.file.filename}`,
                title,
                description,
                altText
            };
            
            sliderData.push(newSlide);
            
            fs.writeFileSync(sliderDataPath, JSON.stringify(sliderData, null, 2));
            
            res.status(StatusCodes.CREATED).json({
                message: 'Slider image added successfully',
                data: newSlide,
                success: true,
            });
        } catch (error) {
            console.error('Error adding slider image:', error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: 'Failed to add slider image',
                success: false,
            });
        }
    });
}

const updateSliderImage = async (req, res) => {
    if (!req.user?.role === 'admin') throw new UnauthenticatedError('Authentication state invalid');
    
    upload(req, res, async function (err) {
        if (err) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: err.message,
                success: false,
            });
        }
        
        try {
            const { id, title, description, altText } = req.body;
            if (!id) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: 'Slide ID is required',
                    success: false,
                });
            }
            
            const sliderDataPath = path.join(__dirname, '..', '..', '..', '..', 'client', 'public', 'static', 'data', 'sliderData.json');
            
            if (!fs.existsSync(sliderDataPath)) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    message: 'Slider data not found',
                    success: false,
                });
            }
            
            const data = fs.readFileSync(sliderDataPath, 'utf8');
            let sliderData = JSON.parse(data);
            const slideIndex = sliderData.findIndex(slide => slide.id === id);
            if (slideIndex === -1) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    message: 'Slide not found',
                    success: false,
                });
            }
            
            const updatedSlide = { ...sliderData[slideIndex] };
            
            if (req.file) {
                // Remove old image if it's not one of the default images
                const oldImagePath = path.join(__dirname, '..', '..', '..', '..', 'client', 'public', updatedSlide.imageUrl);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
                
                updatedSlide.imageUrl = `/static/images/slider/${req.file.filename}`;
            }
            
            if (title) updatedSlide.title = title;
            if (description) updatedSlide.description = description;
            if (altText) updatedSlide.altText = altText;
            
            sliderData[slideIndex] = updatedSlide;
            
            fs.writeFileSync(sliderDataPath, JSON.stringify(sliderData, null, 2));
            
            res.status(StatusCodes.OK).json({
                message: 'Slider image updated successfully',
                data: updatedSlide,
                success: true,
            });
        } catch (error) {
            console.error('Error updating slider image:', error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: 'Failed to update slider image',
                success: false,
            });
        }
    });
}

const deleteSliderImage = async (req, res) => {
    if (!req.user?.role === 'admin') throw new UnauthenticatedError('Authentication state invalid');
    
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: 'Slide ID is required',
                success: false,
            });
        }
        
        const sliderDataPath = path.join(__dirname, '..', '..', '..', '..', 'client', 'public', 'static', 'data', 'sliderData.json');
        
        if (!fs.existsSync(sliderDataPath)) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: 'Slider data not found',
                success: false,
            });
        }
        
        const data = fs.readFileSync(sliderDataPath, 'utf8');
        let sliderData = JSON.parse(data);
        
        const slideIndex = sliderData.findIndex(slide => slide.id === id);
        
        if (slideIndex === -1) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: 'Slide not found',
                success: false,
            });
        }
        
        // Don't allow deleting if there would be less than 1 slide left
        if (sliderData.length <= 1) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: 'Cannot delete the last slide',
                success: false,
            });
        }
        
        const slideToDelete = sliderData[slideIndex];
        
        // Remove image file
        const imagePath = path.join(__dirname, '..', '..', '..', '..', 'client', 'public', slideToDelete.imageUrl);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
        
        sliderData.splice(slideIndex, 1);
        
        fs.writeFileSync(sliderDataPath, JSON.stringify(sliderData, null, 2));
        
        res.status(StatusCodes.OK).json({
            message: 'Slider image deleted successfully',
            success: true,
        });
    } catch (error) {
        console.error('Error deleting slider image:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Failed to delete slider image',
            success: false,
        });
    }
}

/* Creating a CRUD for Category management page */
const getCategory = async (req, res) => {
    try {
        const categories = await Category.findAll();
        if (!categories) {
            throw new NotFoundError('Categories not found');
        }

        res.status(StatusCodes.OK).json({
            message: 'Categories fetched successfully',
            data: categories,
            success: true,
        });
        
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Failed to fetch categories',
            success: false,
        });
    }
}

const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name || !description) {
            throw new BadRequestError('Name and description are required');
        }

        const category = await Category.create({ name, description });

        res.status(StatusCodes.CREATED).json({
            message: 'Category created successfully',
            data: category,
            success: true,
        });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Failed to create category',
            success: false,
        });
    }
}

const updateCategory = async (req, res) => {
    try {
        const { id, name, description } = req.body;
        if (!id || !name || !description) {
            throw new BadRequestError('ID, name, and description are required');
        }

        const category = await Category.findByIdAndUpdate(id, { name, description }, { new: true });

        if (!category) {
            throw new NotFoundError('Category not found');
        }

        res.status(StatusCodes.OK).json({
            message: 'Category updated successfully',
            data: category,
            success: true,
        });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Failed to update category',
            success: false,
        });
    }
}

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            throw new BadRequestError('ID is required');
        }

        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            throw new NotFoundError('Category not found');
        }

        res.status(StatusCodes.OK).json({
            message: 'Category deleted successfully',
            success: true,
        });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Failed to delete category',
            success: false,
        });
    }
}

module.exports = {
    updateMarquee,
    getSliderData,
    addSliderImage,
    updateSliderImage,
    deleteSliderImage,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
}
