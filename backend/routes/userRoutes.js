const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Artwork = require('../models/Artwork');
const { protect, authorize } = require('../middleware/auth');

// Admin routes
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Wishlist - Check status FIRST (before generic :artworkId route)
router.get('/wishlist/check/:artworkId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const inWishlist = user.wishlist && user.wishlist.includes(req.params.artworkId);
    res.json({ success: true, inWishlist });
  } catch (error) {
    console.error('Wishlist check error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Wishlist - Get all
router.get('/wishlist', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json({ success: true, wishlist: user.wishlist || [] });
  } catch (error) {
    console.error('Wishlist fetch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Wishlist - Add/Remove
router.post('/wishlist/:artworkId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const artwork = await Artwork.findById(req.params.artworkId);
    if (!artwork) {
      return res.status(404).json({ success: false, message: 'Artwork not found' });
    }

    // Initialize wishlist array if it doesn't exist
    if (!user.wishlist) {
      user.wishlist = [];
    }

    const isInWishlist = user.wishlist.some(id => id.toString() === req.params.artworkId);

    if (isInWishlist) {
      // Remove from wishlist
      user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.artworkId);
      await user.save();
      return res.json({ success: true, message: 'Removed from wishlist', added: false });
    } else {
      // Add to wishlist
      user.wishlist.push(req.params.artworkId);
      await user.save();
      return res.json({ success: true, message: 'Added to wishlist', added: true });
    }
  } catch (error) {
    console.error('Wishlist toggle error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
