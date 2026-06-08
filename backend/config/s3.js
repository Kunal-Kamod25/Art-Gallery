// backend/config/s3.js
// AWS S3 Configuration for Image Uploads (AWS SDK v3 + multer-s3 v3)

const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');

// Configure AWS SDK v3 S3Client (required by multer-s3 v3)
const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION || 'us-east-1',
});

// Configure multer with S3 storage
const storage = multerS3({
  s3: s3,
  bucket: process.env.AWS_S3_BUCKET_NAME,
  acl: 'public-read',

  // Generate unique filename for each upload
  key: function (req, file, cb) {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 100000);
    const sanitizedFilename = file.originalname
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const filename = `artworks/${timestamp}-${randomNum}-${sanitizedFilename}`;
    cb(null, filename);
  },

  // Auto-detect content type
  contentType: multerS3.AUTO_CONTENT_TYPE,
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, GIF, and WebP images are allowed'), false);
  }
};

// Create multer upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  onError: (err, next) => {
    console.error('Multer error:', err);
    next(err);
  },
});

module.exports = { s3, upload };

