const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', teacherController.getTeachers);
router.put('/:id/status', protect, authorize('Admin'), teacherController.updateTeacherStatus);
router.delete('/:id', protect, authorize('Admin'), teacherController.deleteTeacher);

module.exports = router;
