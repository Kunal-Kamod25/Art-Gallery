const express = require('express');
const router = express.Router();
const { getArtists, getArtist, createArtist, updateArtist, deleteArtist } = require('../controllers/artistController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getArtists);
router.get('/:id', getArtist);
router.post('/', protect, authorize('admin'), createArtist);
router.put('/:id', protect, authorize('admin'), updateArtist);
router.delete('/:id', protect, authorize('admin'), deleteArtist);

module.exports = router;
