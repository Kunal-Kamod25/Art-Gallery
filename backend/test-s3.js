// backend/test-s3.js
// Test AWS S3 Connection

require('dotenv').config();
const AWS = require('aws-sdk');

console.log('\n═════════════════════════════════════════');
console.log('  AWS S3 Configuration Test');
console.log('═════════════════════════════════════════\n');

// Check environment variables
console.log('📋 Environment Variables Check:');
console.log('  - AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✓ Set' : '✗ Not Set');
console.log('  - AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✓ Set (hidden)' : '✗ Not Set');
console.log('  - AWS_REGION:', process.env.AWS_REGION || 'us-east-1 (default)');
console.log('  - AWS_S3_BUCKET_NAME:', process.env.AWS_S3_BUCKET_NAME ? '✓ ' + process.env.AWS_S3_BUCKET_NAME : '✗ Not Set');

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.log('\n❌ Missing AWS credentials in .env file!');
  console.log('Add these to backend/.env:');
  console.log('  AWS_ACCESS_KEY_ID=your_access_key');
  console.log('  AWS_SECRET_ACCESS_KEY=your_secret_key');
  console.log('  AWS_REGION=us-east-1');
  console.log('  AWS_S3_BUCKET_NAME=artgallery-uploads');
  process.exit(1);
}

// Configure AWS
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

console.log('\n🔍 Attempting to list S3 buckets...\n');

// Test connection
s3.listBuckets((err, data) => {
  if (err) {
    console.log('❌ Connection Failed!\n');
    console.log('Error Message:', err.message);
    console.log('Error Code:', err.code);
    
    if (err.code === 'InvalidAccessKeyId') {
      console.log('\n⚠️  The AWS_ACCESS_KEY_ID is invalid or expired.');
    } else if (err.code === 'SignatureDoesNotMatch') {
      console.log('\n⚠️  The AWS_SECRET_ACCESS_KEY is incorrect.');
    } else if (err.code === 'NetworkingError') {
      console.log('\n⚠️  Network error. Check your internet connection.');
    }
    
    console.log('\n💡 Solution:');
    console.log('  1. Go to AWS Console → IAM → Users');
    console.log('  2. Select artgallery-backend user');
    console.log('  3. Create new Access Keys');
    console.log('  4. Update .env with new credentials');
    
    process.exit(1);
  } else {
    console.log('✅ Connection Successful!\n');
    console.log('📦 Available S3 Buckets:');
    
    if (data.Buckets.length === 0) {
      console.log('  (No buckets found)\n');
    } else {
      data.Buckets.forEach(bucket => {
        console.log(`  - ${bucket.Name}`);
        console.log(`    Created: ${bucket.CreationDate.toLocaleDateString()}`);
      });
      console.log();
    }
    
    // Check if target bucket exists
    const targetBucket = process.env.AWS_S3_BUCKET_NAME;
    const bucketExists = data.Buckets.some(b => b.Name === targetBucket);
    
    if (bucketExists) {
      console.log(`✅ Target bucket "${targetBucket}" found!\n`);
    } else {
      console.log(`⚠️  Target bucket "${targetBucket}" NOT found!\n`);
      console.log('Please create the bucket in AWS Console:');
      console.log(`  1. Go to S3 service`);
      console.log(`  2. Create Bucket named: ${targetBucket}`);
      console.log(`  3. Uncheck "Block all public access"`);
      console.log(`  4. Add CORS policy (see guide)`);
      console.log(`  5. Try again\n`);
    }
    
    // Verify bucket access
    if (bucketExists) {
      console.log('🔐 Verifying bucket access...\n');
      
      const bucketParams = {
        Bucket: targetBucket
      };
      
      s3.headBucket(bucketParams, (err, data) => {
        if (err) {
          console.log('⚠️  Bucket exists but access denied!');
          console.log('Error:', err.message);
          console.log('\nSolution:');
          console.log('  - Ensure IAM user has S3FullAccess or custom S3 policy');
          console.log('  - Check bucket policy allows your IAM user');
        } else {
          console.log('✅ Bucket access verified!\n');
          console.log('═════════════════════════════════════════');
          console.log('  ✓ All S3 tests passed!');
          console.log('  Ready to upload files.');
          console.log('═════════════════════════════════════════\n');
        }
      });
    }
  }
});
