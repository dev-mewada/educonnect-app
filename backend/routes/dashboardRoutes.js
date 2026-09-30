const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/admin', protect, authorize('Admin'), dashboardController.getAdminDashboard);
router.get('/teacher', protect, authorize('Teacher'), dashboardController.getTeacherDashboard);
router.get('/student', protect, authorize('Student'), dashboardController.getStudentDashboard);

module.exports = router;
