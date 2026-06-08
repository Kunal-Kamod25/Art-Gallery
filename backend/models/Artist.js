const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  bio: { type: String, required: true },
  nationality: { type: String, required: true },
  birthYear: { type: Number },
  deathYear: { type: Number },
  profileImage: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  specialization: [{ type: String }],
  awards: [{ title: String, year: Number, organization: String }],
  exhibitions: [{ title: String, year: Number, location: String, type: { type: String, enum: ['solo', 'group', 'international'] } }],
  socialLinks: {
    website: String, instagram: String,
    twitter: String, facebook: String
  },
  featured: { type: Boolean, default: false },
  totalSales: { type: Number, default: 0 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

artistSchema.virtual('artworks', {
  ref: 'Artwork', localField: '_id', foreignField: 'artist'
});

module.exports = mongoose.model('Artist', artistSchema);
