const Review = require('../models/Review');
const Artwork = require('../models/Artwork');
const asyncHandler = require('express-async-handler');

exports.createReview = asyncHandler(async (req, res) => {
  const { rating, title, comment } = req.body;
  const existing = await Review.findOne({ user: req.user._id, artwork: req.params.artworkId });
  if (existing) return res.status(400).json({ success: false, message: 'Already reviewed' });
  const review = await Review.create({ user: req.user._id, artwork: req.params.artworkId, rating, title, comment });
  // Update artwork rating
  const reviews = await Review.find({ artwork: req.params.artworkId });
  const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  await Artwork.findByIdAndUpdate(req.params.artworkId, { rating: avg.toFixed(1), numReviews: reviews.length });
  res.status(201).json({ success: true, review });
});

exports.getReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ artwork: req.params.artworkId })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 });
  res.json({ success: true, reviews });
});

exports.deleteReview = asyncHandler(async (req, res) => {
  await Review.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Review deleted' });
});
