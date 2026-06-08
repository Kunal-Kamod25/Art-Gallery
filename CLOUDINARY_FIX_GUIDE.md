# Cloudinary Credential Fix Guide

## Problem
- Current API key `574113729922386` with secret `xtOyqHyW2FqwMa20m_8QrHsDVqU` returns 401 "cloud_name mismatch"
- This means the key/secret pair may be invalid, expired, or restricted

## Solution: Regenerate API Key

### Step 1: Go to Cloudinary Security Settings
1. Open https://cloudinary.com/console
2. Click your avatar → **Settings**
3. In the left menu, click **Security** (or **API Keys**)

### Step 2: Regenerate the API Key
1. Find the key named "artgallery" (or any key you want to use)
2. Click the three-dot menu next to it
3. Click **Regenerate**
4. **IMPORTANT**: A new API Key and API Secret will be shown. Copy both immediately — the secret is displayed only once.

New values will look like:
```
API Key: 123456789012345 (usually 15 digits)
API Secret: abc123def456ghi789jkl (usually 27 characters)
```

### Step 3: Update backend/.env
Replace the old values with the new ones:
```
CLOUDINARY_CLOUD_NAME=dkf6bfm7h
CLOUDINARY_API_KEY=<NEW_API_KEY_HERE>
CLOUDINARY_API_SECRET=<NEW_API_SECRET_HERE>
CLOUDINARY_URL=cloudinary://<NEW_API_KEY_HERE>:<NEW_API_SECRET_HERE>@dkf6bfm7h
```

### Step 4: Test the Connection
From the `backend` folder run:
```bash
node test-cloudinary.js
```

You should see:
```
✓ CLOUDINARY_CLOUD_NAME: Set
✓ CLOUDINARY_API_KEY: Set
✓ CLOUDINARY_API_SECRET: Set
✓ Cloudinary Connection OK
```

### Step 5: Restart Backend & Test Upload
```bash
npm start
# or
node server.js
# or
npx nodemon server.js
```

Then test uploading via the frontend or use:
```bash
node test-upload.js
```

## Quick Test (curl command)
Run this from PowerShell to test credentials directly:
```bash
curl -u "<API_KEY>:<API_SECRET>" "https://api.cloudinary.com/v1_1/<CLOUD_NAME>/ping"
```

Replace:
- `<API_KEY>` with your new API key
- `<API_SECRET>` with your new API secret  
- `<CLOUD_NAME>` with `dkf6bfm7h` (or your actual cloud name from Cloudinary Console)

If successful, you get HTTP 200 with a JSON response:
```json
{"status":"ok"}
```

If 401: The API key/secret pair is invalid or doesn't match the cloud name.

## Security Notes
- **Never** commit the API secret to Git
- If you shared credentials accidentally, regenerate the key immediately
- Treat the secret like a password
