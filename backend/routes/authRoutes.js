const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public authentication routes
router.post('/register', authController.register);
router.get('/registration-status', authController.getRegistrationStatus);
router.post('/login', authController.login);
router.post('/verify-registration-otp', authController.verifyRegistrationOtp);
router.post('/resend-registration-otp', authController.resendRegistrationOtp);
router.post('/complete-registration', authController.completeRegistration);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-reset-otp', authController.verifyResetOtp);
router.post('/reset-password', authController.resetPassword);

// Protected authenticated routes
router.get('/me', protect, authController.getMe);
router.put('/profile', protect, authController.updateProfile);
router.put('/change-password', protect, authController.changePassword);

module.exports = router;
