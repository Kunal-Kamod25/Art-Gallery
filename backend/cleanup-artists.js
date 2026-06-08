const mongoose = require('mongoose');
require('dotenv').config();

const Artist = require('./models/Artist');
const User = require('./models/User');
const Artwork = require('./models/Artwork');

async function cleanupArtists() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected');

    // Find Kunal artist
    console.log('\nSearching for Kunal artist...');
    const kunalArtist = await Artist.findOne({ name: /kunal/i });
    
    if (!kunalArtist) {
      console.log('❌ Kunal artist not found!');
      console.log('Available artists:');
      const allArtists = await Artist.find();
      allArtists.forEach(a => console.log(`- ${a.name} (ID: ${a._id})`));
      return;
    }
    
    console.log(`✓ Found Kunal artist: ${kunalArtist.name} (ID: ${kunalArtist._id})`);

    // Get all other artists
    console.log('\nFinding other artists to remove...');
    const otherArtists = await Artist.find({ _id: { $ne: kunalArtist._id } });
    console.log(`Found ${otherArtists.length} artists to remove`);

    // Remove their artworks
    console.log('\nRemoving artworks from other artists...');
    const otherArtistIds = otherArtists.map(a => a._id);
    const removedArtworks = await Artwork.deleteMany({ artist: { $in: otherArtistIds } });
    console.log(`✓ Removed ${removedArtworks.deletedCount} artworks`);

    // Remove artist references from users and delete artists
    console.log('\nRemoving artist references from users...');
    const usersWithArtists = await User.find({ artist: { $in: otherArtistIds } });
    console.log(`Found ${usersWithArtists.length} users with artist profiles`);
    
    await User.updateMany(
      { artist: { $in: otherArtistIds } },
      { $unset: { artist: 1 } }
    );
    console.log('✓ Removed artist references');

    // Delete old artists
    console.log('\nDeleting old artist records...');
    const deletedArtists = await Artist.deleteMany({ _id: { $in: otherArtistIds } });
    console.log(`✓ Deleted ${deletedArtists.deletedCount} artist records`);

    console.log('\n✅ Cleanup Complete!');
    console.log(`Kept: ${kunalArtist.name}`);
    console.log(`Removed: ${otherArtists.length} artists and ${removedArtworks.deletedCount} artworks`);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Disconnected from MongoDB');
  }
}

cleanupArtists();
