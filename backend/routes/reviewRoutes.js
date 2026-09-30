const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', reviewController.getReviews);
router.post('/', protect, authorize('Student'), reviewController.addReview);

module.exports = router;
