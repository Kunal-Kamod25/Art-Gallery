# AWS S3 Integration Guide for Art Gallery Backend

Complete guide to replace Cloudinary with AWS S3 for image uploads.

---

## Part 1: AWS Setup (10 minutes)

### Step 1.1: Create AWS Account
1. Go to https://aws.amazon.com
2. Click "Create an AWS Account"
3. Sign up with email and credit card
4. Choose "Personal" account type

### Step 1.2: Create S3 Bucket
1. Log in to AWS Console: https://console.aws.amazon.com
2. Search for "S3" → Click on S3 service
3. Click **Create Bucket**
4. **Bucket Name**: `artgallery-uploads` (must be globally unique, add random numbers if taken)
5. **Region**: Select closest to your users (e.g., `us-east-1` or `ap-south-1`)
6. **Block Public Access**: Uncheck "Block all public access" (we need public URLs)
7. Click **Create Bucket**

### Step 1.3: Create Folder Structure in S3
1. In your bucket, create folders:
   - Click **Create Folder** → Type `artworks` → Create
   - Click **Create Folder** → Type `temp-uploads` → Create

Bucket structure:
```
artgallery-uploads/
  ├── artworks/
  ├── temp-uploads/
```

### Step 1.4: Enable CORS (for frontend uploads)
1. In S3 bucket, go to **Permissions** tab
2. Scroll to **CORS** section
3. Click **Edit**
4. Add this CORS policy:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "http://localhost:5000"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```
5. Click **Save**

### Step 1.5: Create IAM User for Backend
1. Search for "IAM" in AWS Console
2. Click **Users** in left menu
3. Click **Create User**
4. **User Name**: `artgallery-backend`
5. Click **Next**
6. Click **Attach Policies Directly**
7. Search for `AmazonS3FullAccess` and check it
8. Click **Next** → **Create User**

### Step 1.6: Create Access Keys
1. Click the newly created user `artgallery-backend`
2. Go to **Security Credentials** tab
3. Scroll to **Access Keys** section
4. Click **Create Access Key**
5. Choose **Application running on an AWS compute service**
6. Click **Next** → **Create Access Key**
7. **IMPORTANT**: Copy and save:
   - **Access Key ID** (e.g., `AKIA1234567890ABCDEF`)
   - **Secret Access Key** (e.g., `wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY`)

⚠️ **Security**: Save these in a safe place. The secret key is shown only once.

---

## Part 2: Backend Setup (15 minutes)

### Step 2.1: Install Required Packages
From `backend` folder:
```bash
npm install aws-sdk multer-s3
```

Or with yarn:
```bash
yarn add aws-sdk multer-s3
```

### Step 2.2: Create S3 Configuration File
Create file: `backend/config/s3.js`

```javascript
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');

// Configure AWS
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

// Configure multer with S3 storage
const storage = multerS3({
  s3: s3,
  bucket: process.env.AWS_S3_BUCKET_NAME,
  acl: 'public-read', // Makes files publicly readable
  key: function (req, file, cb) {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 10000);
    const filename = `artworks/${timestamp}-${randomNum}-${file.originalname}`;
    cb(null, filename);
  },
  contentType: multerS3.AUTO_CONTENT_TYPE,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, GIF, and WebP images are allowed'), false);
  }
};

// Create upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

module.exports = {
  s3,
  upload
};
```

### Step 2.3: Update Environment Variables
Edit `backend/.env` and replace Cloudinary entries with:

```env
# Previous entries stay the same
PORT=5000
MONGO_URI=mongodb+srv://Kunal-Kamod25:Shraddha2503@cluster0.1nz5ywy.mongodb.net/?appName=Cluster0
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=30d
NODE_ENV=development

# Remove these Cloudinary lines:
# CLOUDINARY_CLOUD_NAME=...
# CLOUDINARY_API_KEY=...
# CLOUDINARY_API_SECRET=...

# Add these AWS S3 lines:
AWS_ACCESS_KEY_ID=your_iam_access_key_id
AWS_SECRET_ACCESS_KEY=your_iam_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=artgallery-uploads
```

Replace with your actual AWS credentials.

---

## Part 3: Update Backend Files (20 minutes)

### Step 3.1: Update Artwork Routes
File: `backend/routes/artworkRoutes.js`

Change this:
```javascript
const { upload } = require('../config/cloudinary');
```

To this:
```javascript
const { upload } = require('../config/s3');
```

No other changes needed — same `upload.array('images', 10)` syntax works!

### Step 3.2: Update Artwork Controller
File: `backend/controllers/artworkController.js`

If your controller accesses file paths, update it:

**Old Cloudinary way** (if you have this):
```javascript
const images = req.files.map(file => file.path);
```

**New S3 way**:
```javascript
const images = req.files.map(file => file.location); // S3 public URL
```

Update your Artwork model to store S3 URLs (they're already public):
```javascript
// Store the S3 URLs directly
const artwork = await Artwork.create({
  title,
  description,
  price,
  images: images, // Array of S3 public URLs
  artist: req.user.artist,
  category
});
```

### Step 3.3: Update Artwork Model (if needed)
File: `backend/models/Artwork.js`

The images field should store URLs:
```javascript
images: [{
  type: String, // S3 public URL
  required: true
}],
```

---

## Part 4: Testing (10 minutes)

### Step 4.1: Test S3 Connection
Create file: `backend/test-s3.js`

```javascript
require('dotenv').config();
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

console.log('Testing AWS S3 Configuration...\n');

console.log('Environment Variables:');
console.log('- AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✓ Set' : '✗ Not set');
console.log('- AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✓ Set' : '✗ Not set');
console.log('- AWS_REGION:', process.env.AWS_REGION || 'us-east-1');
console.log('- AWS_S3_BUCKET_NAME:', process.env.AWS_S3_BUCKET_NAME);

console.log('\nAttempting to list buckets...\n');

s3.listBuckets((err, data) => {
  if (err) {
    console.error('❌ Connection Failed!');
    console.error('Error:', err.message);
    process.exit(1);
  } else {
    console.log('✓ Connection OK!\n');
    console.log('Buckets found:');
    data.Buckets.forEach(bucket => {
      console.log(`  - ${bucket.Name} (Created: ${bucket.CreationDate})`);
    });
  }
});
```

Run:
```bash
cd backend
node test-s3.js
```

### Step 4.2: Test File Upload
Create file: `backend/test-s3-upload.js`

```javascript
require('dotenv').config();
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const bucketName = process.env.AWS_S3_BUCKET_NAME;
const testImagePath = path.join(__dirname, 'test-image.jpg');

if (!fs.existsSync(testImagePath)) {
  console.error('❌ test-image.jpg not found in backend folder');
  process.exit(1);
}

console.log('Testing S3 Upload...\n');

const fileContent = fs.readFileSync(testImagePath);
const timestamp = Date.now();
const key = `artworks/${timestamp}-test-image.jpg`;

const params = {
  Bucket: bucketName,
  Key: key,
  Body: fileContent,
  ContentType: 'image/jpeg',
  ACL: 'public-read'
};

s3.upload(params, (err, data) => {
  if (err) {
    console.error('❌ Upload Failed!');
    console.error('Error:', err.message);
    process.exit(1);
  } else {
    console.log('✓ Upload Successful!\n');
    console.log('File URL:', data.Location);
    console.log('File Key:', data.Key);
    console.log('Bucket:', data.Bucket);
    console.log('\nYou can now download from:', data.Location);
  }
});
```

Run:
```bash
cd backend
node test-s3-upload.js
```

---

## Part 5: Restart & Test Full Flow

### Step 5.1: Restart Backend
```bash
cd backend
npm start
# or
node server.js
# or with nodemon:
npx nodemon server.js
```

### Step 5.2: Test Upload via Frontend/API
1. Use the frontend form to upload images
2. Or use curl:
```bash
curl -X POST http://localhost:5000/api/artworks \
  -H "Authorization: Bearer <your_jwt_token>" \
  -F "images=@path/to/image.jpg" \
  -F "title=My Artwork" \
  -F "description=Test" \
  -F "price=100" \
  -F "category=painting"
```

### Step 5.3: Verify in AWS Console
1. Go to S3 bucket: https://console.aws.amazon.com/s3
2. Click your bucket `artgallery-uploads`
3. Open `artworks` folder
4. You should see your uploaded image
5. Click on it → Copy the Object URL
6. Paste in browser → Image should display

---

## Advantages & Disadvantages

### AWS S3 Advantages:
✅ More control and customization
✅ Better for large-scale applications
✅ Pay only for what you use (cheaper for high volume)
✅ Direct S3 integration with other AWS services
✅ No watermarks or restrictions
✅ Better for private/restricted access scenarios

### AWS S3 Disadvantages:
❌ Setup is more complex
❌ Need AWS account and credit card
❌ More services to manage (IAM, buckets, credentials)
❌ No built-in image transformations (need Lambda or CloudFront)
❌ Slightly more expensive for small projects

### Cloudinary Advantages:
✅ Simple setup (2 minutes)
✅ Built-in image transformations & resizing
✅ CDN included
✅ Auto optimization

### Cloudinary Disadvantages:
❌ Less control
❌ Can be expensive for high volume
❌ Watermarks on free tier
❌ Limits on free tier

---

## Troubleshooting

### Issue: "AccessDenied" error on upload
**Solution**: Check IAM user has `AmazonS3FullAccess` policy attached

### Issue: "NoSuchBucket" error
**Solution**: Verify `AWS_S3_BUCKET_NAME` in `.env` matches your actual bucket name

### Issue: Images showing as 403 Forbidden
**Solution**: Bucket CORS policy not set. Go back to Step 1.4 and add CORS config

### Issue: S3 upload works but images aren't public
**Solution**: Add `ACL: 'public-read'` in the S3 config (already done in code above)

### Issue: Uploaded files are empty or corrupted
**Solution**: Ensure file size limits match in both multer config and S3 params

---

## Security Best Practices

1. **Never commit `.env` to Git**
   ```bash
   # Add to .gitignore:
   .env
   .env.local
   ```

2. **Rotate Access Keys Regularly**
   - Every 3-6 months, create new keys
   - Delete old ones in IAM console

3. **Use Environment Variables** (already doing this)
   - Never hardcode AWS credentials in code

4. **Restrict IAM Permissions**
   - Instead of `AmazonS3FullAccess`, create custom policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:GetObject",
           "s3:PutObject",
           "s3:DeleteObject"
         ],
         "Resource": "arn:aws:s3:::artgallery-uploads/*"
       }
     ]
   }
   ```

5. **Enable S3 Versioning & Backup**
   - Go to bucket → Properties → Versioning
   - Enable for accidental deletion protection

---

## Next Steps

1. Complete AWS setup (Part 1)
2. Install packages and create S3 config (Part 2)
3. Update environment variables (Part 2.3)
4. Change one route file to use S3 (Part 3.1)
5. Run test-s3.js to verify connection (Part 4.1)
6. Restart backend and test (Part 5)

---

## Quick Reference Commands

```bash
# Install packages
npm install aws-sdk multer-s3

# Test S3 connection
cd backend
node test-s3.js

# Test S3 upload
node test-s3-upload.js

# Start backend
npm start

# Check .env has correct values
cat .env
```

---

## File Locations to Change

```
backend/
  ├── config/
  │   ├── cloudinary.js  ← DELETE or REPLACE with s3.js
  │   └── s3.js          ← CREATE NEW
  ├── routes/
  │   └── artworkRoutes.js  ← UPDATE import (line 4)
  ├── controllers/
  │   └── artworkController.js  ← UPDATE file.path to file.location (if used)
  ├── models/
  │   └── Artwork.js  ← Ensure images field stores URLs
  ├── .env  ← UPDATE with AWS credentials
  ├── test-s3.js  ← CREATE NEW
  └── test-s3-upload.js  ← CREATE NEW
```

---

## Cost Estimation (AWS S3)

- **Storage**: $0.023 per GB/month (first 50TB)
- **Upload**: $0.005 per 1,000 requests
- **Download**: $0.09 per GB (after 1GB free)
- **Typical small project**: $0-5/month

For comparison, Cloudinary free tier: 25GB storage, then $99/month for more.

---

**Need help? Run the commands step by step and let me know which step fails.**
