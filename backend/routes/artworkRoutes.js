const express = require('express');
const router = express.Router();
const { getArtworks, getArtwork, createArtwork, updateArtwork, deleteArtwork, deleteArtworkImage, toggleWishlist } = require('../controllers/artworkController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/s3');

router.get('/', getArtworks);
router.get('/:id', getArtwork);
router.post('/', protect, authorize('admin', 'artist'), upload.array('images', 10), createArtwork);
router.put('/:id', protect, authorize('admin', 'artist'), upload.array('images', 10), updateArtwork);
router.delete('/:id', protect, authorize('admin', 'artist'), deleteArtwork);
router.delete('/:artworkId/images/:imageId', protect, authorize('admin', 'artist'), deleteArtworkImage);
router.put('/:id/wishlist', protect, toggleWishlist);

module.exports = router;
