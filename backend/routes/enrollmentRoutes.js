const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('Student'), enrollmentController.enrollInCourse);
router.get('/my', protect, authorize('Student'), enrollmentController.getMyEnrollments);
router.patch('/:id/progress', protect, authorize('Student'), enrollmentController.updateProgress);
router.get('/check/:courseId', protect, enrollmentController.checkEnrollment);

module.exports = router;
