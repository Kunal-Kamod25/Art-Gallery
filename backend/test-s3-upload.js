// backend/test-s3-upload.js
// Test AWS S3 File Upload

require('dotenv').config();
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

console.log('\n═════════════════════════════════════════');
console.log('  AWS S3 Upload Test');
console.log('═════════════════════════════════════════\n');

// Check for test image
const testImagePath = path.join(__dirname, 'test-image.jpg');

if (!fs.existsSync(testImagePath)) {
  console.log('❌ test-image.jpg not found!\n');
  console.log('📝 To test uploads, place a JPEG image in the backend folder:');
  console.log(`   ${testImagePath}\n`);
  console.log('Then run this script again.\n');
  process.exit(1);
}

// Get file info
const stats = fs.statSync(testImagePath);
console.log('📋 Test File Info:');
console.log(`  - Path: ${testImagePath}`);
console.log(`  - Size: ${(stats.size / 1024).toFixed(2)} KB`);
console.log(`  - Modified: ${stats.mtime.toLocaleDateString()}\n`);

// Check environment variables
console.log('🔑 AWS Configuration:');
console.log('  - AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✓ Set' : '✗ Not Set');
console.log('  - AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✓ Set (hidden)' : '✗ Not Set');
console.log('  - AWS_REGION:', process.env.AWS_REGION || 'us-east-1 (default)');
console.log('  - AWS_S3_BUCKET_NAME:', process.env.AWS_S3_BUCKET_NAME || '✗ Not Set\n');

if (!process.env.AWS_S3_BUCKET_NAME) {
  console.log('❌ AWS_S3_BUCKET_NAME not set in .env\n');
  process.exit(1);
}

// Configure AWS
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

// Prepare upload parameters
const bucketName = process.env.AWS_S3_BUCKET_NAME;
const timestamp = Date.now();
const randomNum = Math.floor(Math.random() * 100000);
const key = `artworks/${timestamp}-${randomNum}-test-image.jpg`;

console.log('📤 Upload Parameters:');
console.log(`  - Bucket: ${bucketName}`);
console.log(`  - Key: ${key}`);
console.log(`  - ACL: public-read`);
console.log(`  - Content-Type: image/jpeg\n`);

console.log('⏳ Uploading to S3...\n');

const fileContent = fs.readFileSync(testImagePath);

const params = {
  Bucket: bucketName,
  Key: key,
  Body: fileContent,
  ContentType: 'image/jpeg',
  ACL: 'public-read',
  Metadata: {
    'uploaded-by': 'test-script',
    'upload-time': new Date().toISOString()
  }
};

s3.upload(params, (err, data) => {
  if (err) {
    console.log('❌ Upload Failed!\n');
    console.log('Error Message:', err.message);
    console.log('Error Code:', err.code);
    
    if (err.code === 'NoSuchBucket') {
      console.log('\n⚠️  Bucket does not exist!');
      console.log('Create bucket in AWS Console:');
      console.log(`  1. S3 service → Create Bucket`);
      console.log(`  2. Name: ${bucketName}`);
      console.log(`  3. Uncheck "Block all public access"`);
      console.log(`  4. Create\n`);
    } else if (err.code === 'InvalidBucketName') {
      console.log('\n⚠️  Bucket name is invalid!');
      console.log('Bucket names must be lowercase and contain only alphanumerics and hyphens.\n');
    } else if (err.code === 'AccessDenied') {
      console.log('\n⚠️  Access Denied! IAM user lacks S3 permissions.');
      console.log('Solution:');
      console.log('  1. Go to AWS Console → IAM → Users → artgallery-backend');
      console.log('  2. Attach policy: AmazonS3FullAccess');
      console.log('  3. Try again\n');
    }
    
    process.exit(1);
  } else {
    console.log('✅ Upload Successful!\n');
    console.log('📋 Upload Details:');
    console.log(`  - Bucket: ${data.Bucket}`);
    console.log(`  - Key: ${data.Key}`);
    console.log(`  - ETag: ${data.ETag}`);
    console.log(`  - Location: ${data.Location}\n`);
    
    console.log('🌐 Access Your Image:');
    console.log(`  ${data.Location}\n`);
    
    console.log('📸 Try opening the URL in your browser to verify!\n');
    
    console.log('═════════════════════════════════════════');
    console.log('  ✓ Upload test passed!');
    console.log('  You can now use S3 for artwork uploads.');
    console.log('═════════════════════════════════════════\n');
  }
});
