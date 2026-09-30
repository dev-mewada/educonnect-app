const express = require('express');
const router = express.Router();
const liveClassController = require('../controllers/liveClassController');
const { protect, authorize, optionalAuth } = require('../middleware/authMiddleware');

router.get('/', optionalAuth, liveClassController.getLiveClasses);
router.get('/my-attendance', protect, authorize('Student'), liveClassController.getMyAttendance);
router.get('/attendance/my', protect, authorize('Student'), liveClassController.getMyAttendance);
router.get('/:id', optionalAuth, liveClassController.getLiveClassById);
router.get('/:id/attendance', protect, authorize('Admin', 'Teacher'), liveClassController.getClassAttendance);

router.post('/', protect, authorize('Admin', 'Teacher'), liveClassController.createLiveClass);
router.put('/:id', protect, authorize('Admin', 'Teacher'), liveClassController.updateLiveClass);
router.delete('/:id', protect, authorize('Admin', 'Teacher'), liveClassController.deleteLiveClass);

router.post('/:id/start', protect, authorize('Admin', 'Teacher'), liveClassController.startLiveClass);
router.patch('/:id/start', protect, authorize('Admin', 'Teacher'), liveClassController.startLiveClass);

router.post('/:id/end', protect, authorize('Admin', 'Teacher'), liveClassController.endLiveClass);
router.patch('/:id/end', protect, authorize('Admin', 'Teacher'), liveClassController.endLiveClass);

router.post('/:id/check-in', protect, authorize('Student'), liveClassController.checkInLiveClass);
router.post('/:id/attendance', protect, authorize('Student'), liveClassController.checkInLiveClass);

module.exports = router;
