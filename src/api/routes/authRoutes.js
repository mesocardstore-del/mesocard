const express = require('express');
const { 
    userRegister, 
    userLogin,
    forgotPassword,
    resetPassword,
    validateToken
} = require('../controllers/authController');

const router = express.Router();

// Local Authentication Routes
router.post('/register', userRegister);
router.post('/login', userLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/validate-token', validateToken);

module.exports = router;