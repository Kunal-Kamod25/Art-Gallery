const Artwork = require('../models/Artwork');
const Artist = require('../models/Artist');
const { s3 } = require('../config/s3');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const asyncHandler = require('express-async-handler');

const deleteFromS3 = async (key) => {
  if (!key || !process.env.AWS_S3_BUCKET_NAME) return;
  await s3.send(new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
  }));
};

exports.getArtworks = asyncHandler(async (req, res) => {
  const { category, artist, minPrice, maxPrice, search, sort, page = 1, limit = 12, featured } = req.query;
  const query = {};
  if (category) query.category = category;
  if (artist) query.artist = artist;
  if (featured === 'true') query.isFeatured = true;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (search) query.$text = { $search: search };

  const sortOptions = {
    newest: { createdAt: -1 }, oldest: { createdAt: 1 },
    'price-low': { price: 1 }, 'price-high': { price: -1 }, popular: { views: -1 }
  };

  const total = await Artwork.countDocuments(query);
  const artworks = await Artwork.find(query)
    .populate('artist', 'name profileImage nationality')
    .populate('category', 'name slug')
    .sort(sortOptions[sort] || { createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / limit), artworks });
});

exports.getArtwork = asyncHandler(async (req, res) => {
  const artwork = await Artwork.findById(req.params.id)
    .populate('artist', 'name profileImage bio nationality specialization socialLinks')
    .populate('category', 'name slug');
  if (!artwork) return res.status(404).json({ success: false, message: 'Artwork not found' });
  await Artwork.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
  res.json({ success: true, artwork });
});

exports.createArtwork = asyncHandler(async (req, res) => {
  let artistId = req.body.artist;
  if (req.user.role === 'artist') {
    const artistProfile = await Artist.findOne({ user: req.user._id });
    if (!artistProfile) return res.status(400).json({ success: false, message: 'Artist profile not found for current user' });
    artistId = artistProfile._id;
  }

  // Process uploaded images
  let images = [];
  if (req.files && req.files.length > 0) {
    images = req.files.map((file, index) => ({
      url: file.location || file.path,
      publicId: file.key || file.filename,
      isPrimary: index === 0, // First image is primary
    }));
  }

  // Parse dimensions if provided
  let dimensions = {};
  if (req.body.dimensions) {
    try {
      dimensions = JSON.parse(req.body.dimensions);
    } catch (error) {
      dimensions = {};
    }
  }

  const artworkData = {
    ...req.body,
    artist: artistId,
    images,
    dimensions,
  };

  const artwork = await Artwork.create(artworkData);
  res.status(201).json({ success: true, artwork });
});

exports.updateArtwork = asyncHandler(async (req, res) => {
  const artwork = await Artwork.findById(req.params.id);
  if (!artwork) return res.status(404).json({ success: false, message: 'Artwork not found' });

  if (req.user.role === 'artist') {
    const artistProfile = await Artist.findOne({ user: req.user._id });
    if (!artistProfile || artwork.artist.toString() !== artistProfile._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this artwork' });
    }
  }

  const updateData = { ...req.body };
  if (req.user.role === 'artist') delete updateData.artist;

  // Handle new image uploads
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((file, index) => ({
      url: file.location || file.path,
      publicId: file.key || file.filename,
      isPrimary: index === 0 && (!artwork.images || artwork.images.length === 0),
    }));

    // If this is the first upload, make the first image primary
    if (!artwork.images || artwork.images.length === 0) {
      newImages[0].isPrimary = true;
    }

    updateData.images = [...(artwork.images || []), ...newImages];
  }

  // Parse dimensions if provided
  if (req.body.dimensions) {
    try {
      updateData.dimensions = JSON.parse(req.body.dimensions);
    } catch (error) {
      // Keep existing dimensions if parsing fails
    }
  }

  const updatedArtwork = await Artwork.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
  res.json({ success: true, artwork: updatedArtwork });
});

exports.deleteArtwork = asyncHandler(async (req, res) => {
  const artwork = await Artwork.findById(req.params.id);
  if (!artwork) return res.status(404).json({ success: false, message: 'Artwork not found' });

  if (req.user.role === 'artist') {
    const artistProfile = await Artist.findOne({ user: req.user._id });
    if (!artistProfile || artwork.artist.toString() !== artistProfile._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this artwork' });
    }
  }

  // Delete images from storage provider
  if (artwork.images && artwork.images.length > 0) {
    await Promise.all(artwork.images.map(async (image) => {
      if (!image?.publicId) return;
      await deleteFromS3(image.publicId);
    }));
  }

  await artwork.remove();
  res.json({ success: true, message: 'Artwork deleted' });
});

exports.deleteArtworkImage = asyncHandler(async (req, res) => {
  const { artworkId, imageId } = req.params;
  const artwork = await Artwork.findById(artworkId);
  if (!artwork) return res.status(404).json({ success: false, message: 'Artwork not found' });

  if (req.user.role === 'artist') {
    const artistProfile = await Artist.findOne({ user: req.user._id });
    if (!artistProfile || artwork.artist.toString() !== artistProfile._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this artwork' });
    }
  }

  const imageIndex = artwork.images.findIndex(img => img._id.toString() === imageId);
  if (imageIndex === -1) return res.status(404).json({ success: false, message: 'Image not found' });

  const image = artwork.images[imageIndex];

  // Delete from storage provider
  if (image.publicId) {
    await deleteFromS3(image.publicId);
  }

  // Remove from artwork
  artwork.images.splice(imageIndex, 1);

  // If we removed the primary image and there are other images, make the first one primary
  if (image.isPrimary && artwork.images.length > 0) {
    artwork.images[0].isPrimary = true;
  }

  await artwork.save();
  res.json({ success: true, artwork });
});

exports.toggleWishlist = asyncHandler(async (req, res) => {
  const user = req.user;
  const artworkId = req.params.id;
  const idx = user.wishlist.indexOf(artworkId);
  if (idx > -1) { user.wishlist.splice(idx, 1); }
  else { user.wishlist.push(artworkId); }
  await user.save();
  res.json({ success: true, wishlist: user.wishlist });
});
