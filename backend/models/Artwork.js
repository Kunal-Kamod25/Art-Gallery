const mongoose = require('mongoose');

const artworkSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number },
  medium: { type: String, default: '' },
  dimensions: {
    width: Number, height: Number, depth: Number,
    unit: { type: String, enum: ['cm', 'inches'], default: 'cm' }
  },
  weight: { type: Number },
  year: { type: Number, required: true },
  images: [{
    url: { type: String, required: true },
    publicId: String,
    isPrimary: { type: Boolean, default: false }
  }],
  tags: [String],
  isAvailable: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  edition: { type: String, default: 'Original' },
  provenance: { type: String },
  certificate: { type: Boolean, default: true },
  shippingInfo: {
    weight: Number,
    requiresSpecialHandling: { type: Boolean, default: false },
    estimatedDays: { type: Number, default: 14 }
  },
  views: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 }
}, { timestamps: true });

artworkSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Artwork', artworkSchema);
