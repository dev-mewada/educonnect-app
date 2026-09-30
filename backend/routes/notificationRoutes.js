const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/authMiddleware');

// General notification endpoints for any authenticated user (Admin, Teacher, Student)
router.get('/', protect, notificationController.getNotifications);
router.get('/unread-count', protect, notificationController.getUnreadCount);
router.put('/mark-all-read', protect, notificationController.markAllAsRead);
router.put('/:id/read', protect, notificationController.markAsRead);

// Registration management routes - Admin only
router.get('/registrations/:applicantId', protect, authorize('Admin'), notificationController.getRegistrationDetails);
router.post('/registrations/:applicantId/approve', protect, authorize('Admin'), notificationController.approveRegistration);
router.post('/registrations/:applicantId/reject', protect, authorize('Admin'), notificationController.rejectRegistration);
router.delete('/registrations/:applicantId', protect, authorize('Admin'), notificationController.deletePendingRegistration);

module.exports = router;
