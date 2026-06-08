const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    console.log(`📍 Connection URI: ${process.env.MONGO_URI.substring(0, 50)}...`);
    
    // Set mongoose connection options with shorter timeouts
    const options = {
      connectTimeoutMS: 10000,  // 10 seconds
      socketTimeoutMS: 15000,    // 15 seconds
      serverSelectionTimeoutMS: 10000,  // 10 seconds
      retryWrites: true,
      maxPoolSize: 5,
    };

    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    
    // Log more details for debugging
    if (error.name === 'MongoServerSelectionError') {
      console.error('💡 Common fixes:');
      console.error('   1. Check IP Whitelist: Network Access > IP Access List in Atlas');
      console.error('   2. Verify credentials: username and password in MONGO_URI');
      console.error('   3. Ensure cluster is running and accessible');
    }
    
    // Exit after 5 seconds to allow log output
    setTimeout(() => process.exit(1), 5000);
  }
};

module.exports = connectDB;
