# 🔧 Firebase Storage CORS Fix Guide

## 🎯 Problem Analysis

Based on the error logs, the main issues are:

1. **CORS errors** when uploading images to Firebase Storage
2. **404 Not Found** errors for OPTIONS preflight requests
3. **Network errors** preventing successful image uploads

## ✅ Root Cause

The CORS configuration for Firebase Storage is not properly set up, causing browser security restrictions to block upload requests.

## 🔧 Solution Steps

### 1. **Verify Environment Variables**

First, ensure your `.env` file has the correct storage bucket:

```env
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=wastetowish.appspot.com
```

**Important**: The bucket name should be in the format `PROJECT_ID.appspot.com`, not `PROJECT_ID.firebasestorage.app`.

### 2. **Install Google Cloud SDK**

If you haven't already, install the Google Cloud SDK which includes `gsutil`:

**Windows:**

```bash
# Download from: https://cloud.google.com/sdk/docs/install
```

**macOS:**

```bash
brew install --cask google-cloud-sdk
```

**Linux:**

```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

### 3. **Authenticate with Google Cloud**

```bash
gcloud auth login
gcloud config set project wastetowish
```

### 4. **Apply CORS Configuration**

Run the CORS setup script:

```bash
node scripts/setup-cors.js
```

Or manually apply the CORS configuration:

```bash
gsutil cors set firebase-storage-cors.json gs://wastetowish.appspot.com
```

### 5. **Verify CORS Configuration**

```bash
gsutil cors get gs://wastetowish.appspot.com
```

You should see output similar to:

```json
[
  {
    "maxAgeSeconds": 3600,
    "method": ["GET", "PUT", "POST", "DELETE"],
    "origin": [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://192.168.1.9:3001"
    ]
  }
]
```

### 6. **Update Firebase Storage Rules**

In the Firebase Console, go to Storage → Rules and update them to:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🛠️ Code Improvements

### 1. **Enhanced Error Handling**

The updated code now includes:

- Retry logic for failed uploads
- Better error messages for users
- Graceful degradation when uploads fail

### 2. **File Validation**

Added client-side validation:

- File size limits (10MB max)
- File type validation (images only)
- File name validation

### 3. **Improved User Experience**

- Clear error messages
- Progress indicators
- Success notifications

## 🧪 Testing Steps

1. **Test Storage Connection**

   - Go to `/add-item` page
   - Click "Test Storage" button
   - Verify it shows "Storage test successful!"

2. **Test File Upload**

   - Select a small image file (under 5MB)
   - Click "Publish Item"
   - Check browser console for errors

3. **Verify Dashboard Display**
   - Go to `/dashboard`
   - Confirm the newly added item appears in "Recent Items"

## 🚨 Common Issues & Solutions

### 1. **CORS Error Persists**

**Solution**:

- Double-check the bucket name in your `.env` file
- Re-run the CORS setup script
- Wait a few minutes for changes to propagate

### 2. **404 Error on OPTIONS Request**

**Solution**:

- Verify Firebase Storage rules allow authenticated users
- Check that the storage bucket exists in Firebase Console

### 3. **Network Request Failed**

**Solution**:

- Check internet connection
- Try with a smaller file
- Test with different network

### 4. **Permission Denied**

**Solution**:

- Ensure you're logged in to the app
- Verify Firebase Authentication is working
- Check Firebase project settings

## 🔄 Alternative Solutions

If the above steps don't work:

1. **Use Firebase Console to Set CORS**:

   - Go to Firebase Console → Storage → Files
   - Manually upload a test file
   - Check for any error messages

2. **Temporarily Disable CORS (Development Only)**:

   - Add `http://localhost:3000` to allowed origins in Firebase Console
   - Only for development/testing purposes

3. **Use a Different Storage Solution**:
   - Consider Cloudinary or AWS S3 for image storage
   - More complex but potentially more reliable

## 📋 Checklist

- [ ] Environment variables configured correctly
- [ ] Google Cloud SDK installed
- [ ] Authenticated with Google Cloud
- [ ] CORS configuration applied
- [ ] Firebase Storage rules updated
- [ ] Test storage connection
- [ ] Test file upload
- [ ] Verify dashboard display

## 🆘 Support

If you continue to have issues:

1. Check the Firebase Console for error logs
2. Verify your Firebase project settings
3. Ensure all dependencies are installed
4. Try uploading a smaller file first

---

**Result**: After following these steps, you should be able to successfully upload images and see them displayed in the dashboard! 🎉
