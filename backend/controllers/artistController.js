const Artist = require('../models/Artist');
const Artwork = require('../models/Artwork');
const asyncHandler = require('express-async-handler');

exports.getArtists = asyncHandler(async (req, res) => {
  const { featured, user, page = 1, limit = 12 } = req.query;
  const query = {};
  if (featured === 'true') query.featured = true;
  if (user) query.user = user;
  const total = await Artist.countDocuments(query);
  const artists = await Artist.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  res.json({ success: true, total, artists });
});

exports.getArtist = asyncHandler(async (req, res) => {
  const artist = await Artist.findById(req.params.id);
  if (!artist) return res.status(404).json({ success: false, message: 'Artist not found' });
  const artworks = await Artwork.find({ artist: artist._id })
    .populate('category', 'name slug')
    .sort({ createdAt: -1 });
  res.json({ success: true, artist, artworks });
});

exports.createArtist = asyncHandler(async (req, res) => {
  const artist = await Artist.create(req.body);
  res.status(201).json({ success: true, artist });
});

exports.updateArtist = asyncHandler(async (req, res) => {
  const artist = await Artist.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!artist) return res.status(404).json({ success: false, message: 'Artist not found' });
  res.json({ success: true, artist });
});

exports.deleteArtist = asyncHandler(async (req, res) => {
  await Artist.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Artist deleted' });
});
