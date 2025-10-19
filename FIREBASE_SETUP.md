# Firebase Storage CORS Setup Guide

This guide will help you set up Firebase Storage CORS configuration to resolve upload issues.

## Prerequisites

1. **Google Cloud SDK** installed on your system
2. **Firebase CLI** installed
3. **Authentication** with Google Cloud

## Setup Steps

### 1. Install Google Cloud SDK

**Windows:**

```bash
# Download and install from: https://cloud.google.com/sdk/docs/install
# Or use Chocolatey:
choco install gcloudsdk
```

**macOS:**

```bash
# Using Homebrew:
brew install --cask google-cloud-sdk
```

**Linux:**

```bash
# Using apt:
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

### 2. Authenticate with Google Cloud

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### 3. Set up CORS Configuration

The CORS configuration is already set up in `firebase-storage-cors.json`. To apply it:

```bash
# Method 1: Using the npm script
npm run setup-cors

# Method 2: Manual command
gsutil cors set firebase-storage-cors.json gs://YOUR_BUCKET_NAME
```

### 4. Verify CORS Configuration

```bash
gsutil cors get gs://YOUR_BUCKET_NAME
```

## Alternative: Firebase Console Setup

If you prefer using the Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Storage** → **Rules**
4. Update the storage rules to allow uploads:

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

## Troubleshooting

### Common Issues:

1. **CORS Error**: Make sure CORS is properly configured
2. **404 Error**: Check if the storage bucket exists and is accessible
3. **Permission Denied**: Verify Firebase Storage rules allow authenticated users
4. **Network Error**: Check your internet connection and Firebase project status

### Debug Steps:

1. Check browser console for detailed error messages
2. Verify Firebase configuration in `lib/firebase.ts`
3. Ensure environment variables are set correctly
4. Test with a simple file upload first

## Environment Variables Required

Make sure these are set in your `.env.local` file:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Testing Upload

After setup, test the upload functionality:

1. Go to `/add-item` page
2. Fill in the form
3. Select an image file
4. Click "Publish Item"
5. Check the browser console for any errors
6. Verify the item appears in `/dashboard`

## Support

If you continue to have issues:

1. Check the Firebase Console for error logs
2. Verify your Firebase project settings
3. Ensure all dependencies are installed
4. Try uploading a smaller file first
