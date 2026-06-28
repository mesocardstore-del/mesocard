const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'client', 'public', 'static', 'uploads', 'profiles');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('مسموح فقط بملفات الصور'), false);
        }
    }
}).single('profileImage');

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
                message: err.message || 'حدث خطأ اثناء تحميل الملف'
            });
        }
        // Everything went fine
        next();
    });
};

module.exports = { upload: handleMulterErrors };