const express = require('express');
const router = express.Router();
const { createReview, getReviews, deleteReview } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.get('/artwork/:artworkId', getReviews);
router.post('/artwork/:artworkId', protect, createReview);
router.delete('/:id', protect, authorize('admin'), deleteReview);

module.exports = router;
