// src/api/routes/uploadRoutes.js
const express = require('express');
const { authenticationRole, authentication } = require('../middlewares/authentication');
const { upload: uploadBankImage } = require('../../config/multer_banks');
const { upload: uploadBankNoticeImage } = require('../../config/multer_bank_notice');
const path = require('path');
const router = express.Router();

router.post('/bank', authenticationRole('admin'), uploadBankImage.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    let filePath = req.file.path.replace(/\\/g, '/');
    
    const publicPath = path.join(process.cwd(), 'client', 'public').replace(/\\/g, '/');
    filePath = filePath.replace(publicPath, '');

    res.json({ 
        success: true, 
        filePath 
    });
});

router.post('/bankNotice', authentication, uploadBankNoticeImage.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    let filePath = req.file.path.replace(/\\/g, '/');

    const privatePath = path.join(process.cwd(), 'client', 'private_uploads', 'bank_notice_image').replace(/\\/g, '/');
    filePath = filePath.replace(privatePath, '');

    res.json({ 
        success: true, 
        filePath 
    });
});

module.exports = router;