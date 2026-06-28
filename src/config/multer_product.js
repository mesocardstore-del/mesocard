const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'client', 'public', 'static', 'images', 'products');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = uuidv4() + '-' + Date.now();
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, uniqueSuffix + ext);
    }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Initialize multer with configuration
const upload = multer({ 
    storage: storage,
    limits: { 
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1 // Limit to 1 file per request
    },
    fileFilter: fileFilter
}).single('image');

// Error handling middleware for multer
const handleMulterErrors = (req, res, next) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading
            return res.status(400).json({
                success: false,
                message: err.message
            });
        } else if (err) {
            // An unknown error occurred
            return res.status(500).json({
                success: false,
                message: err.message || 'Error uploading file'
            });
        }
        // Everything went fine
        next();
    });
};

module.exports = {
    upload: handleMulterErrors
};
