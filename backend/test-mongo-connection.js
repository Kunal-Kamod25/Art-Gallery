require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB direct connection succeeded');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB direct connection failed');
    console.error(err);
    process.exit(1);
  });
