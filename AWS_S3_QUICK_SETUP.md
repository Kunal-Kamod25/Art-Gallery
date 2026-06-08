# Quick AWS S3 Bucket Setup for Art Gallery Project

You already have AWS account, so this is just creating a NEW bucket for this project.

---

## Step 1: Create New S3 Bucket (5 minutes)

1. Go to: https://console.aws.amazon.com/s3
2. Click **Create Bucket** button
3. Fill in:
   - **Bucket Name**: `artgallery-uploads-2025` (must be globally unique)
   - **Region**: Same as your other bucket (e.g., `us-east-1` or `ap-south-1`)
   - Click **Next**

4. **Permissions** tab:
   - Uncheck: "Block all public access"
   - ✓ Acknowledge the warning
   - Click **Next**

5. Review → Click **Create Bucket**

✅ Bucket created!

---

## Step 2: Create Folder Structure

1. Click on your new bucket name `artgallery-uploads-2025`
2. Click **Create Folder** → Type `artworks` → Create
3. Click **Create Folder** → Type `temp-uploads` → Create

Your bucket now has:
```
artgallery-uploads-2025/
  ├── artworks/
  ├── temp-uploads/
```

---

## Step 3: Enable CORS (Important!)

1. In your bucket, go to **Permissions** tab
2. Scroll down to **CORS**
3. Click **Edit**
4. Paste this:

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

5. Click **Save Changes**

---

## Step 4: Create IAM User for This Project (5 minutes)

Use your EXISTING IAM account if you already have one, or create a new one just for this project.

### Option A: Create NEW IAM User (Recommended for security)

1. Go to: https://console.aws.amazon.com/iam/home#/users
2. Click **Create User**
3. **User Name**: `artgallery-backend`
4. Click **Next**
5. Click **Attach Policies Directly**
6. Search and check: `AmazonS3FullAccess`
7. Click **Next** → **Create User**

### Option B: Use Existing IAM User
- Just add a new access key to your existing user (go to Step 5)

---

## Step 5: Create Access Keys

### If you created new user:
1. Click the user name `artgallery-backend`
2. Go to **Security Credentials** tab
3. Scroll to **Access Keys**
4. Click **Create Access Key**
5. Choose: **Application running outside AWS** (or **Other**)
6. Click **Next** → **Create Access Key**

### If using existing user:
1. Go to IAM → Users → Your User
2. **Security Credentials** tab
3. Scroll to **Access Keys**
4. Click **Create Access Key** (if you don't already have one)
5. Note: You can have max 2 active keys per user

---

## Step 6: Copy Your Credentials

⚠️ **IMPORTANT**: The Secret Access Key is shown ONLY ONCE. Copy both now:

- **Access Key ID**: (looks like: AKIA1234567890ABCDEF)
- **Secret Access Key**: (looks like: wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY)

**Do NOT close the page** until you update your `.env` file!

---

## Step 7: Update Your Backend `.env`

Edit: `backend/.env`

Replace/Add these lines:

```env
# Remove or comment out old Cloudinary lines:
# CLOUDINARY_CLOUD_NAME=...
# CLOUDINARY_API_KEY=...
# CLOUDINARY_API_SECRET=...

# Add AWS S3 credentials:
AWS_ACCESS_KEY_ID=PASTE_YOUR_ACCESS_KEY_ID_HERE
AWS_SECRET_ACCESS_KEY=PASTE_YOUR_SECRET_ACCESS_KEY_HERE
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=artgallery-uploads-2025
```

**Example** (with fake credentials):
```env
PORT=5000
MONGO_URI=mongodb+srv://Kunal-Kamod25:Shraddha2503@cluster0.1nz5ywy.mongodb.net/?appName=Cluster0
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=30d
NODE_ENV=development

AWS_ACCESS_KEY_ID=AKIA5678901234567890
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG+jbPxRfiCYNEWEXAMPLEKEY
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=artgallery-uploads-2025
```

---

## Step 8: Install S3 Packages

From `backend` folder:

```bash
npm install aws-sdk multer-s3
```

---

## Step 9: Update Routes File

File: `backend/routes/artworkRoutes.js`

Change line 4 from:
```javascript
const { upload } = require('../config/cloudinary');
```

To:
```javascript
const { upload } = require('../config/s3');
```

That's it! The `upload.array('images', 10)` syntax works the same.

---

## Step 10: Test Connection

From `backend` folder:

```bash
node test-s3.js
```

You should see:
```
✅ Connection Successful!
✅ Target bucket "artgallery-uploads-2025" found!
✅ Bucket access verified!
✓ All S3 tests passed!
```

---

## Step 11: Test Upload

Place a test image in `backend` folder named `test-image.jpg`, then:

```bash
node test-s3-upload.js
```

You should see:
```
✅ Upload Successful!
📋 Upload Details:
  - Bucket: artgallery-uploads-2025
  - Key: artworks/1717859...
  - Location: https://artgallery-uploads-2025.s3.amazonaws.com/artworks/...

🌐 Access Your Image:
  https://artgallery-uploads-2025.s3.amazonaws.com/artworks/...
```

---

## Step 12: Restart Backend & Test

```bash
npm start
# or
node server.js
# or
npx nodemon server.js
```

Then use your frontend to upload images or test via API.

---

## Verify Upload in AWS Console

1. Go to S3 bucket: https://console.aws.amazon.com/s3
2. Click `artgallery-uploads-2025`
3. Open `artworks` folder
4. You should see your uploaded files
5. Click one → Copy the Object URL → Paste in browser to verify image displays

---

## Cost for This Bucket

For your art gallery project (typical usage):
- **Storage**: ~$0.023/GB/month (first 50TB)
- **Uploads**: ~$0.005 per 1,000 PUT requests
- **Downloads**: ~$0.09/GB (after 1GB free)

**Monthly estimate**: $0-5 for small project

---

## Security Checklist

- ✅ Never commit `.env` to Git
- ✅ Access keys are private like passwords
- ✅ If you accidentally share keys, delete them immediately in IAM console
- ✅ Can create new keys anytime without downtime
- ✅ Consider using separate IAM user per project (for isolation)

---

## Troubleshooting

**Error: "NoSuchBucket"**
- Verify bucket name in `.env` matches AWS bucket name exactly
- Check region

**Error: "AccessDenied"**
- Ensure IAM user has `AmazonS3FullAccess` policy
- Or custom policy with S3 permissions

**Error: "InvalidAccessKeyId" or "SignatureDoesNotMatch"**
- Verify `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in `.env` are correct
- No extra spaces or line breaks

**Images return 403 Forbidden**
- Enable CORS (Step 3)
- Ensure `ACL: 'public-read'` in S3 config (already done in `backend/config/s3.js`)

**Images not showing in S3 console**
- Refresh the page
- Check `artworks` folder (not root)

---

## Quick Commands Reference

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

# View .env (verify credentials)
cat .env
```

---

## Summary

1. ✅ Create S3 bucket `artgallery-uploads-2025`
2. ✅ Enable CORS
3. ✅ Create IAM user or use existing
4. ✅ Create access keys
5. ✅ Update `backend/.env`
6. ✅ Install `aws-sdk` and `multer-s3`
7. ✅ Update `backend/routes/artworkRoutes.js` (1 line change)
8. ✅ Run `node test-s3.js` to verify
9. ✅ Restart backend
10. ✅ Test upload

**Done!** Your backend now uploads images to your new S3 bucket instead of Cloudinary.

---

**Need help? Let me know which step you're on and I'll assist!**
