const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('Admin', 'Teacher'), studentController.getStudents);
router.put('/:id/status', protect, authorize('Admin'), studentController.updateStudentStatus);
router.delete('/:id', protect, authorize('Admin'), studentController.deleteStudent);

module.exports = router;

