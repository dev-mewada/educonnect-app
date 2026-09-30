const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { protect, authorize, optionalAuth } = require('../middleware/authMiddleware');

router.get('/', optionalAuth, courseController.getCourses);
router.get('/:id', optionalAuth, courseController.getCourseById);
router.get('/:id/enrollments', protect, authorize('Admin', 'Teacher'), courseController.getCourseEnrollments);
router.post('/', protect, authorize('Admin', 'Teacher'), courseController.createCourse);
router.put('/:id', protect, authorize('Admin', 'Teacher'), courseController.updateCourse);
router.patch('/:id/publish', protect, authorize('Admin', 'Teacher'), courseController.togglePublish);
router.delete('/:id', protect, authorize('Admin', 'Teacher'), courseController.deleteCourse);

module.exports = router;
