const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const dns = require('dns');
dotenv.config();

// Fix DNS resolution for MongoDB Atlas
dns.setServers(['8.8.8.8', '8.8.4.4']);

const User = require('../models/User');
const Artist = require('../models/Artist');
const Category = require('../models/Category');
const Artwork = require('../models/Artwork');

mongoose.connect(process.env.MONGO_URI);

const seed = async () => {
  try {
    await User.deleteMany();
    await Artist.deleteMany();
    await Category.deleteMany();
    await Artwork.deleteMany();

    const salt = await bcrypt.genSalt(10);

    // Admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@artgallery.com',
      password: await bcrypt.hash('Admin@123', salt),
      role: 'admin'
    });

    // Regular user
    await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: await bcrypt.hash('User@123', salt),
      role: 'user'
    });

    // Categories
    const cats = await Category.insertMany([
      { name: 'Painting', description: 'Traditional and modern paintings', slug: 'painting' },
      { name: 'Sculpture', description: 'Three-dimensional artworks', slug: 'sculpture' },
      { name: 'Photography', description: 'Fine art photography', slug: 'photography' },
      { name: 'Digital Art', description: 'Digital and NFT artworks', slug: 'digital-art' },
      { name: 'Drawing', description: 'Sketches and illustrations', slug: 'drawing' },
    ]);

    // Artists
    const artists = await Artist.insertMany([
      {
        name: 'Elena Vasquez',
        bio: 'Contemporary painter known for vibrant abstract expressions. Born in Madrid, Elena has exhibited worldwide.',
        nationality: 'Spanish',
        birthYear: 1985,
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        specialization: ['Painting', 'Mixed Media'],
        socialLinks: { instagram: 'elena_art', website: 'elenavasquez.com' },
        featured: true
      },
      {
        name: 'Marcus Chen',
        bio: 'Award-winning sculptor and installation artist. His work explores themes of identity and culture.',
        nationality: 'Chinese-American',
        birthYear: 1978,
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        specialization: ['Sculpture', 'Installation'],
        socialLinks: { instagram: 'marcus_sculptures' },
        featured: true
      },
      {
        name: 'Sophia Laurent',
        bio: 'Fine art photographer with a passion for landscape and portraiture. Based in Paris.',
        nationality: 'French',
        birthYear: 1990,
        profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
        specialization: ['Photography'],
        socialLinks: { instagram: 'sophia_lens', website: 'sophialaurent.fr' },
        featured: false
      },
      {
        name: 'Arjun Patel',
        bio: 'Digital artist pushing boundaries of visual storytelling through technology and tradition.',
        nationality: 'Indian',
        birthYear: 1992,
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
        specialization: ['Digital Art'],
        socialLinks: { instagram: 'arjun_digital' },
        featured: false
      },
    ]);

    // Artworks
    await Artwork.insertMany([
      {
        title: 'Crimson Dreams',
        description: 'A bold exploration of passion and emotion through sweeping crimson strokes and golden accents. This masterpiece evokes raw human emotion.',
        artist: artists[0]._id,
        category: cats[0]._id,
        price: 4500,
        medium: 'Oil on Canvas',
        dimensions: { width: 120, height: 90, unit: 'cm' },
        year: 2023,
        images: [
          { url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800', isPrimary: false }
        ],
        tags: ['abstract', 'bold', 'emotional'],
        isAvailable: true,
        isFeatured: true,
        edition: 'Original'
      },
      {
        title: 'Serenity in Blue',
        description: 'Calm ocean-inspired abstract that brings peace and tranquility to any space.',
        artist: artists[0]._id,
        category: cats[0]._id,
        price: 3200,
        medium: 'Acrylic on Canvas',
        dimensions: { width: 100, height: 80, unit: 'cm' },
        year: 2023,
        images: [
          { url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800', isPrimary: true }
        ],
        tags: ['calm', 'blue', 'ocean'],
        isAvailable: true,
        isFeatured: true,
        edition: 'Original'
      },
      {
        title: 'Echoes of Time',
        description: 'Bronze sculpture representing the passage of time through intertwined figures.',
        artist: artists[1]._id,
        category: cats[1]._id,
        price: 8900,
        medium: 'Bronze',
        dimensions: { width: 40, height: 65, depth: 30, unit: 'cm' },
        year: 2022,
        images: [
          { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', isPrimary: true }
        ],
        tags: ['sculpture', 'bronze', 'time'],
        isAvailable: true,
        isFeatured: true,
        edition: 'Limited Edition 3/10'
      },
      {
        title: 'Urban Fragments',
        description: 'Mixed media sculpture made from reclaimed city materials — a commentary on urban culture.',
        artist: artists[1]._id,
        category: cats[1]._id,
        price: 5600,
        medium: 'Mixed Media',
        dimensions: { width: 50, height: 80, depth: 40, unit: 'cm' },
        year: 2023,
        images: [
          { url: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=800', isPrimary: true }
        ],
        tags: ['urban', 'modern', 'mixed-media'],
        isAvailable: true,
        isFeatured: false,
        edition: 'Original'
      },
      {
        title: 'Golden Hour in Provence',
        description: 'A breathtaking capture of the French countryside bathed in warm golden light.',
        artist: artists[2]._id,
        category: cats[2]._id,
        price: 1800,
        medium: 'Fine Art Print',
        dimensions: { width: 80, height: 60, unit: 'cm' },
        year: 2023,
        images: [
          { url: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800', isPrimary: true }
        ],
        tags: ['landscape', 'golden', 'france'],
        isAvailable: true,
        isFeatured: true,
        edition: 'Limited Edition 5/25'
      },
      {
        title: 'Neural Garden',
        description: 'AI-assisted digital artwork exploring the intersection of nature and technology.',
        artist: artists[3]._id,
        category: cats[3]._id,
        price: 950,
        medium: 'Digital Print on Aluminum',
        dimensions: { width: 90, height: 70, unit: 'cm' },
        year: 2024,
        images: [
          { url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800', isPrimary: true }
        ],
        tags: ['digital', 'nature', 'technology'],
        isAvailable: true,
        isFeatured: true,
        edition: 'Edition of 50'
      },
      {
        title: 'Solitude',
        description: 'An intimate black and white portrait capturing the essence of solitude and reflection.',
        artist: artists[2]._id,
        category: cats[2]._id,
        price: 2200,
        medium: 'Silver Gelatin Print',
        dimensions: { width: 60, height: 80, unit: 'cm' },
        year: 2022,
        images: [
          { url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800', isPrimary: true }
        ],
        tags: ['portrait', 'black-white', 'solitude'],
        isAvailable: true,
        isFeatured: false,
        edition: 'Limited Edition 7/20'
      },
      {
        title: 'Fire and Ice',
        description: 'Abstract expressionist painting contrasting warm and cool tones in dynamic tension.',
        artist: artists[0]._id,
        category: cats[0]._id,
        price: 5100,
        medium: 'Oil and Enamel on Canvas',
        dimensions: { width: 150, height: 110, unit: 'cm' },
        year: 2024,
        images: [
          { url: 'https://images.unsplash.com/photo-1565799557186-8ada34e50e74?w=800', isPrimary: true }
        ],
        tags: ['abstract', 'contrast', 'expressionist'],
        isAvailable: true,
        isFeatured: false,
        edition: 'Original'
      }
    ]);

    console.log('✅ Database seeded successfully!');
    console.log('👤 Admin: admin@artgallery.com / Admin@123');
    console.log('👤 User: john@example.com / User@123');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
